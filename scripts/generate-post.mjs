/**
 * Claude API로 뉴스를 한국어 바이럴 포스트로 변환
 * 실행: ANTHROPIC_API_KEY=xxx node scripts/generate-post.mjs
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { collectNews } from './fetch-news.mjs'

const client = new Anthropic()

const SYSTEM_PROMPT = `당신은 한국의 바이럴 뉴스 블로그 작가입니다.
해외 뉴스를 받으면 한국 독자들이 클릭하고 싶어지는 자극적이고 흥미로운 블로그 포스트로 변환합니다.

규칙:
- 제목은 "충격)", "경악)", "황당)" 등 감탄사로 시작하거나 숫자를 활용해 클릭을 유도
- 본문은 스토리텔링 방식으로 독자를 끌어당김
- 중간에 독자의 반응을 유도하는 질문이나 반전 포함
- 마지막에 짧은 한 줄 코멘트로 마무리
- 관련 제품 키워드 3개를 추출 (쿠팡에서 팔 수 있는 실물 상품)
- MDX 포맷으로 출력 (frontmatter 포함)

frontmatter 형식:
---
title: "제목"
date: "YYYY-MM-DD"
description: "2-3줄 요약"
tags: ["태그1", "태그2"]
source_url: "원문URL"
product_keywords: ["키워드1", "키워드2", "키워드3"]
---`

async function generatePost(newsItem) {
  const userMessage = `다음 해외 뉴스를 한국어 바이럴 블로그 포스트로 변환해주세요:

제목: ${newsItem.title}
내용: ${newsItem.text || '(제목만 있음)'}
출처: ${newsItem.permalink || newsItem.url}
날짜: ${newsItem.created || new Date().toISOString()}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  })

  return sanitizeMdx(response.content[0].text)
}

// Claude가 ```mdx ... ``` 코드펜스로 감싸는 경우 제거
function sanitizeMdx(text) {
  let t = text.trim()
  t = t.replace(/^```(?:mdx|markdown|md)?\s*\n/, '')
  t = t.replace(/\n```\s*$/, '')
  return t.trim()
}

function mdxToSlug(title) {
  // 슬러그는 ASCII만 (한글 URL은 라우팅에서 깨짐). 영문/숫자만 남기고 없으면 news로
  const ascii = title
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `news-${ascii || 'item'}-${Date.now()}`
}

function extractFrontmatter(mdxContent) {
  const match = mdxContent.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const titleMatch = match[1].match(/title:\s*"([^"]+)"/)
  return titleMatch?.[1] || null
}

async function savePost(mdxContent, filename) {
  const postsDir = path.join(process.cwd(), 'posts')
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true })

  const filepath = path.join(postsDir, `${filename}.mdx`)
  fs.writeFileSync(filepath, mdxContent, 'utf8')
  console.log(`저장 완료: ${filepath}`)
  return filepath
}

async function run(count = 3) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY 환경변수가 필요합니다')
  }

  console.log('뉴스 수집 중...')
  const news = await collectNews()

  // 점수 높은 순으로 정렬, 이미 처리된 것 제외
  const existingSlugs = new Set(
    fs.readdirSync(path.join(process.cwd(), 'posts')).map(f => f.replace('.mdx', ''))
  )

  const candidates = news
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, count * 3) // 여유분 포함

  let generated = 0
  for (const item of candidates) {
    if (generated >= count) break

    console.log(`\n생성 중: ${item.title.slice(0, 60)}...`)
    try {
      const mdxContent = await generatePost(item)
      const title = extractFrontmatter(mdxContent)
      const slug = mdxToSlug(title || item.title)

      if (!existingSlugs.has(slug)) {
        await savePost(mdxContent, slug)
        existingSlugs.add(slug)
        generated++
      }

      // API rate limit 방지
      await new Promise(r => setTimeout(r, 1000))
    } catch (e) {
      console.warn(`생성 실패: ${e.message}`)
    }
  }

  console.log(`\n완료: ${generated}개 포스트 생성`)
}

const count = parseInt(process.argv[2] || '3')
run(count)
