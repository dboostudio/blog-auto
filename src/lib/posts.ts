import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export type PostCategory = 'news' | 'howto'

export interface PostMeta {
  slug: string
  title: string
  date: string
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
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
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
