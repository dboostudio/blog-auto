import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export type PostCategory = 'news' | 'howto'

export interface PostMeta {
  slug: string
  title: string
  date: string
  published?: string   // 실제 발행 ISO 타임스탬프 (정확한 "N시간 전"용)
  description: string
  tags: string[]
  category?: PostCategory
  cover_image?: string
  cover_image_credit?: string
  source_url?: string
  affiliate_products?: AffiliateProduct[]
}

export interface AffiliateProduct {
  name: string
  url: string
  image?: string
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return []
  const files = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.mdx'))

  return files
    .map(filename => {
      // macOS NFD 파일명 → NFC로 정규화해 URL/슬러그 일관성 유지
      const slug = filename.replace('.mdx', '').normalize('NFC')
      const fullPath = path.join(postsDirectory, filename)
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'))
      return { slug, ...data } as PostMeta
    })
    // 실제 발행시각(published) 기준 최신순. 없으면 date 폴백.
    .sort((a, b) => (b.published || b.date || '').localeCompare(a.published || a.date || ''))
}

/**
 * 관련 글: 공유 태그 수 + 같은 카테고리로 점수화해 가장 관련 높은 글 우선.
 * 매칭이 부족하면 최신 글로 채운다.
 */
export function getRelatedPosts(slug: string, limit = 4): PostMeta[] {
  const all = getAllPosts()
  const current = all.find(p => p.slug === slug)
  if (!current) return all.filter(p => p.slug !== slug).slice(0, limit)

  const curTags = new Set(current.tags || [])
  const scored = all
    .filter(p => p.slug !== slug)
    .map(p => {
      const shared = (p.tags || []).filter(t => curTags.has(t)).length
      const sameCat = p.category === current.category ? 0.5 : 0
      return { p, score: shared * 2 + sameCat }
    })
    .sort((a, b) => b.score - a.score || (b.p.published || b.p.date || '').localeCompare(a.p.published || a.p.date || ''))

  return scored.slice(0, limit).map(s => s.p)
}

export function getPostBySlug(slug: string) {
  const target = slug.normalize('NFC')
  // 디스크 파일명이 NFD일 수 있어, 정규화 비교로 매칭
  const files = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.mdx'))
  const filename = files.find(f => f.replace('.mdx', '').normalize('NFC') === target)
  if (!filename) throw new Error(`Post not found: ${slug}`)

  const fullPath = path.join(postsDirectory, filename)
  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)
  return { meta: { slug: target, ...data } as PostMeta, content }
}
