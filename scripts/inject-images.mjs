/**
 * Pexels 스톡 이미지 자동 삽입 (무료, 상업적 이용 가능)
 * 없으면 비워둠 → 추후 AI 생성으로 보완 가능
 *
 * Pexels API 키 발급: https://www.pexels.com/api/
 * 실행: PEXELS_API_KEY=xxx node scripts/inject-images.mjs
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''

// 한국어 키워드 → 영어 검색어 매핑 (Pexels는 영어 검색이 결과가 많음)
const KEYWORD_MAP = {
  '김치찌개': 'korean stew kimchi',
  '레시피': 'cooking food recipe',
  '요리': 'cooking kitchen',
  '동물': 'animal',
  '호주': 'australia',
  '결혼': 'wedding',
  '여행': 'travel',
  '운동': 'workout fitness',
  '청소': 'cleaning home',
  '캠핑': 'camping outdoor',
}

function toSearchQuery(keywords) {
  for (const kw of keywords) {
    if (KEYWORD_MAP[kw]) return KEYWORD_MAP[kw]
  }
  // 매핑 없으면 첫 키워드 그대로 (Pexels가 일부 한글도 처리)
  return keywords[0] || 'news'
}

async function searchPexelsImage(query) {
  if (!PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY 없음 — 이미지 스킵')
    return null
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } })

  if (!res.ok) {
    console.warn(`Pexels API 오류 ${res.status}`)
    return null
  }

  const json = await res.json()
  const photo = json.photos?.[0]
  if (!photo) return null

  return {
    url: photo.src.large,       // 적당한 해상도
    photographer: photo.photographer,
    alt: photo.alt || query,
  }
}

async function injectImage(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8')
  const { data, content } = matter(raw)

  if (data.cover_image) {
    console.log(`스킵 (이미 이미지 있음): ${path.basename(filepath)}`)
    return
  }

  const keywords = data.product_keywords || data.tags || []
  const query = toSearchQuery(keywords)

  const image = await searchPexelsImage(query)
  if (!image) {
    console.log(`이미지 못 찾음: ${path.basename(filepath)} (검색어: ${query})`)
    return
  }

  data.cover_image = image.url
  data.cover_image_credit = image.photographer

  fs.writeFileSync(filepath, matter.stringify(content, data), 'utf8')
  console.log(`✓ ${path.basename(filepath)} — 이미지 삽입 (검색어: ${query})`)
}

async function run() {
  const postsDir = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))

  for (const file of files) {
    try {
      await injectImage(path.join(postsDir, file))
      await new Promise(r => setTimeout(r, 300))
    } catch (e) {
      console.warn(`실패 ${file}:`, e.message)
    }
  }
  console.log('\n이미지 삽입 완료')
}

run()
