/**
 * Claude API로 「~하는 법」/레시피 하우투 콘텐츠 생성
 * 검색 유입 + 높은 구매 의도를 노린 에버그린 콘텐츠
 *
 * 실행: ANTHROPIC_API_KEY=xxx node scripts/generate-howto.mjs [개수]
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const client = new Anthropic()

// 하우투 주제 풀 — 구매 의도가 높은(상품 연결되는) 주제 위주
const TOPIC_POOL = [
  { topic: '김치찌개 맛있게 끓이는 법', category: '요리', products: ['김치찌개 밀키트', '돼지고기 앞다리살', '뚝배기'] },
  { topic: '집에서 아메리카노 맛있게 내리는 법', category: '요리', products: ['홈카페 캡슐머신', '원두', '전동 그라인더'] },
  { topic: '캠핑 초보가 꼭 챙겨야 할 준비물', category: '캠핑', products: ['캠핑 텐트', '캠핑 의자', '버너'] },
  { topic: '자취방 곰팡이 제거하는 법', category: '청소', products: ['곰팡이 제거제', '제습기', '환풍기'] },
  { topic: '홈트로 뱃살 빼는 법', category: '운동', products: ['요가매트', '아령 세트', '폼롤러'] },
  { topic: '겨울철 실내 건조 해결하는 법', category: '생활', products: ['가습기', '미니 화분', '온습도계'] },
  { topic: '강아지 분리불안 줄이는 법', category: '반려동물', products: ['노즈워크 매트', '자동 급식기', '강아지 장난감'] },
  { topic: '잠 잘 오게 하는 법', category: '건강', products: ['수면 안대', '메모리폼 베개', '아로마 디퓨저'] },
]

const SYSTEM_PROMPT = `당신은 한국의 실용 정보 블로그 작가입니다.
「~하는 법」 형태의 하우투 콘텐츠를 작성합니다. 검색해서 들어온 독자가 끝까지 읽고 만족하도록,
구체적이고 따라하기 쉬운 단계별 가이드를 씁니다.

규칙:
- 제목은 검색에 잘 걸리도록 명확하게 ("김치찌개 맛있게 끓이는 법 | 황금레시피 5단계")
- 도입부: 독자의 고민에 공감 (2-3줄)
- 본문: ## 단계별 소제목으로 구조화, 구체적 수치/팁 포함
- 중간에 "💡 꿀팁" 박스 1-2개
- 자연스럽게 필요한 도구/재료를 언급 (나중에 상품 링크가 붙음)
- 마지막: 요약 + 격려 한마디
- MDX 포맷, frontmatter 포함

frontmatter 형식 (정확히 지킬 것):
---
title: "제목"
date: "${new Date().toISOString().slice(0, 10)}"
description: "한 줄 요약 (검색결과에 노출됨)"
tags: ["태그1", "태그2", "태그3"]
category: "howto"
product_keywords: ["상품키워드1", "상품키워드2", "상품키워드3"]
---`

async function generateHowto(item) {
  const userMessage = `다음 주제로 하우투 블로그 글을 작성해주세요:

주제: ${item.topic}
분야: ${item.category}
연결할 상품 예시: ${item.products.join(', ')}

product_keywords에는 쿠팡에서 검색 가능한 실제 상품 키워드를 넣어주세요.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  })

  return response.content[0].text
}

function makeSlug(topic) {
  return 'howto-' + topic
    .replace(/[^\w\s가-힣]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 40) + '-' + Date.now()
}

function savePost(mdx, slug) {
  const postsDir = path.join(process.cwd(), 'posts')
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true })
  const filepath = path.join(postsDir, `${slug}.mdx`)
  fs.writeFileSync(filepath, mdx, 'utf8')
  console.log(`저장: ${filepath}`)
}

async function run(count = 3) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY 환경변수가 필요합니다')
  }

  // 주제 풀에서 랜덤하게 count개 선택 (중복 방지)
  const shuffled = [...TOPIC_POOL].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, TOPIC_POOL.length))

  let generated = 0
  for (const item of selected) {
    console.log(`\n생성 중: ${item.topic}`)
    try {
      const mdx = await generateHowto(item)
      savePost(mdx, makeSlug(item.topic))
      generated++
      await new Promise(r => setTimeout(r, 1000))
    } catch (e) {
      console.warn(`생성 실패: ${e.message}`)
    }
  }
  console.log(`\n완료: ${generated}개 하우투 생성`)
}

const count = parseInt(process.argv[2] || '3')
run(count)
