/**
 * 트렌드/검색 기반 소재 수집 (키 불필요)
 * - viral: 구글 트렌드 한국 일일 인기검색어 (실시간 화제) + 관련 뉴스 링크
 * - howto: 구글 뉴스 RSS에서 "신청/발급/지원금" 등 실용·행정 뉴스 (대상자 확인·신청법 글감)
 *
 * 실행: node scripts/fetch-trends.mjs > scripts/trend-candidates.json
 */

function decode(s = '') {
  return s
    .replace(/&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .trim()
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))
  return m ? decode(m[1].replace(/<!\[CDATA\[|\]\]>/g, '')) : ''
}

async function fetchViral() {
  const res = await fetch('https://trends.google.com/trending/rss?geo=KR')
  if (!res.ok) return []
  const xml = await res.text()
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
  return items.slice(0, 10).map(it => {
    const news = (it.match(/<ht:news_item>[\s\S]*?<\/ht:news_item>/g) || []).map(n => ({
      title: tag(n, 'ht:news_item_title'),
      url: tag(n, 'ht:news_item_url'),
      source: tag(n, 'ht:news_item_source'),
    }))
    return {
      keyword: tag(it, 'title'),
      traffic: tag(it, 'ht:approx_traffic'),
      news,
    }
  })
}

// 실용·행정 글감용 검색어 — 고RPM(금융·세금·법률·부동산) 위주로 구성
const HOWTO_QUERIES = [
  // 지원금·행정 (검색량 큼)
  '지원금 신청', '환급 신청', '정부24 발급', '지원 대상 신청',
  // 고RPM: 세금·금융·대출·보험·부동산·법률
  '연말정산 환급', '종합소득세 신고', '대출 한도 조회', '전세자금대출 조건',
  '보험금 청구', '실업급여 신청', '부동산 취득세', '소액 소송 신청',
]

async function fetchHowtoNews() {
  const out = []
  for (const q of HOWTO_QUERIES) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`
      const res = await fetch(url)
      if (!res.ok) continue
      const xml = await res.text()
      const items = (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, 3)
      for (const it of items) {
        out.push({ query: q, title: tag(it, 'title'), url: tag(it, 'link'), source: tag(it, 'source') })
      }
      await new Promise(r => setTimeout(r, 300))
    } catch { /* skip */ }
  }
  return out
}

async function run() {
  const [viral, howto] = await Promise.all([fetchViral(), fetchHowtoNews()])
  process.stdout.write(JSON.stringify({ viral, howto }, null, 2))
}

run()
