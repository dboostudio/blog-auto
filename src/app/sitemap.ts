import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map(post => ({
    url: `${SITE.url}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const staticPages = ['/about', '/contact', '/privacy', '/terms'].map(path => ({
    url: `${SITE.url}${path}`,
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }))

  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    ...staticPages,
    ...posts,
  ]
}
