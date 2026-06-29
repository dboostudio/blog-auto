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
  '김치찌개': 'kimchi stew',
  '레시피': 'korean food recipe',
  '요리': 'cooking kitchen',
  '집밥레시피': 'home cooked korean food',
  '동물': 'animal',
  '호주': 'australia',
  '결혼': 'wedding',
  '여행': 'travel',
  '운동': 'workout fitness',
  '홈트': 'home workout',
  '청소': 'cleaning home',
  '곰팡이제거': 'mold cleaning bathroom',
  '캠핑': 'camping outdoor',
  '수면': 'sleep bedroom',
  '반려동물': 'pet dog',
  '건강': 'healthy lifestyle',
}

// 카테고리/슬러그 접두사 기준 기본 검색어
const CATEGORY_FALLBACK = { howto: 'lifestyle home', news: 'world news' }

// 슬러그에서 영어 검색어 추출: "energy-voucher-2026" → "energy voucher 2026"
// (구 형식 "howto-...-1782..." 도 호환)
function queryFromSlug(slug) {
  return slug
    .replace(/^(viral|howto|news)-/, '')   // 구 prefix 호환
    .replace(/-\d{10,}$/, '')              // 구 타임스탬프 호환
    .replace(/-/g, ' ')
    .trim()
}

function toSearchQuery(data, slug) {
  // 1순위: 글이 명시한 영어 검색어
  if (data.image_query) return data.image_query
  // 2순위: 태그 매핑
  for (const kw of data.tags || []) {
    if (KEYWORD_MAP[kw]) return KEYWORD_MAP[kw]
  }
  // 3순위: 슬러그에서 추출한 영어 (대부분 여기서 잡힘)
  const fromSlug = queryFromSlug(slug)
  if (fromSlug && /[a-z]/i.test(fromSlug)) return fromSlug
  // 4순위: 카테고리 기본값
  return CATEGORY_FALLBACK[data.category] || 'lifestyle'
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

  const slug = path.basename(filepath, '.mdx')
  const query = toSearchQuery(data, slug)

  // 1차 검색 → 결과 없으면 카테고리 기본값으로 폴백
  let image = await searchPexelsImage(query)
  if (!image) {
    const fb = CATEGORY_FALLBACK[data.category] || 'lifestyle'
    console.log(`검색어 "${query}" 결과 없음 → 폴백 "${fb}"`)
    image = await searchPexelsImage(fb)
  }
  if (!image) {
    console.log(`이미지 못 찾음: ${path.basename(filepath)}`)
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
