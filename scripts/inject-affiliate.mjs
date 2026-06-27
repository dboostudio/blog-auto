/**
 * 쿠팡 파트너스 검색 링크 자동 삽입 (API 불필요)
 * 파트너스 가입 후 COUPANG_PARTNERS_ID 만 있으면 동작
 *
 * 실행: COUPANG_PARTNERS_ID=xxx node scripts/inject-affiliate.mjs
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// 파트너스 가입 시 발급되는 ID (예: AF1234567)
const PARTNERS_ID = process.env.COUPANG_PARTNERS_ID || ''

/**
 * 쿠팡 검색 결과 페이지에 파트너스 ID를 붙인 제휴 링크 생성
 * - API 승인 없이도 클릭 → 구매 시 수익 발생
 * - lptag 파라미터에 파트너스 ID 삽입
 */
function buildCoupangSearchLinks(keywords) {
  return keywords.slice(0, 3).map(keyword => ({
    name: `"${keyword}" 쿠팡에서 보기`,
    url: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}&lptag=${PARTNERS_ID}`,
    image: null,
  }))
}

async function injectAffiliateLinks(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8')
  const { data, content } = matter(raw)

  if (data.affiliate_products?.length > 0) {
    console.log(`스킵 (이미 처리됨): ${path.basename(filepath)}`)
    return
  }

  const keywords = data.product_keywords || data.tags || []
  if (keywords.length === 0) {
    console.log(`스킵 (키워드 없음): ${path.basename(filepath)}`)
    return
  }

  if (!PARTNERS_ID) {
    console.warn('COUPANG_PARTNERS_ID 없음 — .env.local에 설정해주세요')
  }

  data.affiliate_products = buildCoupangSearchLinks(keywords)

  const updated = matter.stringify(content, data)
  fs.writeFileSync(filepath, updated, 'utf8')
  console.log(`✓ ${path.basename(filepath)} — ${data.affiliate_products.length}개 링크 삽입`)
}

async function run() {
  const postsDir = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))

  for (const file of files) {
    try {
      await injectAffiliateLinks(path.join(postsDir, file))
    } catch (e) {
      console.warn(`실패 ${file}:`, e.message)
    }
  }

  console.log('\n제휴 링크 삽입 완료')
}

run()
