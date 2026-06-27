/**
 * 해외 황당뉴스 수집 스크립트
 * 소스: Reddit (r/nottheonion, r/worldnews) + RSS
 * 실행: node scripts/fetch-news.mjs
 */

const REDDIT_SUBREDDITS = [
  'nottheonion',   // 진짜인데 어니언처럼 황당한 뉴스
  'worldnews',     // 해외 주요 뉴스
  'mildlyinteresting',
  'tifu',          // Today I F***ed Up - 황당 실수담
]

const RSS_SOURCES = [
  // AP 뉴스 - 세계 주요 뉴스
  'https://feeds.apnews.com/rss/oddities',
  // Reuters Odd News
  'https://feeds.reuters.com/reuters/oddlyEnoughNews',
]

async function fetchRedditPosts(subreddit, limit = 10) {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'blog-auto-bot/1.0' }
  })
  if (!res.ok) throw new Error(`Reddit fetch failed: ${res.status}`)
  const json = await res.json()

  return json.data.children
    .map(({ data }) => ({
      source: `reddit/r/${subreddit}`,
      title: data.title,
      url: data.url,
      permalink: `https://reddit.com${data.permalink}`,
      score: data.score,
      created: new Date(data.created_utc * 1000).toISOString(),
      text: data.selftext || '',
    }))
    .filter(p => p.score > 100) // 최소 100 upvote 이상만
}

async function fetchRSSFeed(url) {
  try {
    const res = await fetch(url)
    const text = await res.text()

    // 간단한 RSS 파싱 (title, link, description 추출)
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(text)) !== null) {
      const item = match[1]
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] || ''
      if (title) items.push({ source: url, title, url: link, text: description })
    }
    return items
  } catch (e) {
    console.warn(`RSS fetch failed for ${url}:`, e.message)
    return []
  }
}

export async function collectNews() {
  const results = []

  // Reddit 수집
  for (const sub of REDDIT_SUBREDDITS) {
    try {
      console.log(`Fetching r/${sub}...`)
      const posts = await fetchRedditPosts(sub, 5)
      results.push(...posts)
      // Rate limit 방지
      await new Promise(r => setTimeout(r, 500))
    } catch (e) {
      console.warn(`Failed r/${sub}:`, e.message)
    }
  }

  // RSS 수집
  for (const rssUrl of RSS_SOURCES) {
    try {
      console.log(`Fetching RSS: ${rssUrl}`)
      const items = await fetchRSSFeed(rssUrl)
      results.push(...items)
    } catch (e) {
      console.warn(`Failed RSS:`, e.message)
    }
  }

  console.log(`\n총 ${results.length}개 뉴스 수집 완료`)
  return results
}

// 직접 실행 시 결과 출력
if (process.argv[1].endsWith('fetch-news.mjs')) {
  const news = await collectNews()
  console.log(JSON.stringify(news.slice(0, 3), null, 2))
}
