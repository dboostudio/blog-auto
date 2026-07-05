import { getAllPosts } from '@/lib/posts'
import { SITE } from '@/lib/site'

// RSS 2.0 피드. 뉴스레터 서비스(Buttondown 등) RSS-to-email 및 구독기 연동용.
export const dynamic = 'force-static'

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function GET() {
  const posts = getAllPosts().slice(0, 30)
  const build = new Date().toUTCString()

  const items = posts
    .map(p => {
      const url = `${SITE.url}/posts/${p.slug}`
      const pub = new Date(p.published || p.date).toUTCString()
      const cat = p.category === 'howto' ? '생활정보' : p.category === 'econ' ? '경제' : '이슈·화제'
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pub}</pubDate>
      <category>${esc(cat)}</category>
      <description>${esc(p.description || '')}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${esc(SITE.description)}</description>
    <language>ko</language>
    <lastBuildDate>${build}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
