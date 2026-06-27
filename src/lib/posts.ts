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
      const slug = filename.replace('.mdx', '')
      const fullPath = path.join(postsDirectory, filename)
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'))
      return { slug, ...data } as PostMeta
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)
  return { meta: { slug, ...data } as PostMeta, content }
}
