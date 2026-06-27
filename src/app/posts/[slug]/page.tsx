import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let post
  try {
    post = getPostBySlug(slug)
  } catch {
    notFound()
  }

  const { meta, content } = post

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-blue-500 hover:underline mb-6 inline-block">← 목록으로</Link>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 leading-snug">{meta.title}</h1>
      <p className="text-gray-400 text-sm mt-2">
        {format(new Date(meta.date), 'yyyy년 M월 d일', { locale: ko })}
      </p>

      {meta.tags?.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {meta.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      <article className="prose prose-gray mt-8 max-w-none">
        <MDXRemote source={content} />
      </article>

      {/* 제휴 상품 */}
      {meta.affiliate_products && meta.affiliate_products.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🛍️ 관련 상품</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meta.affiliate_products.map((product, i) => (
              <a
                key={i}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-contain rounded" />
                )}
                <span className="text-sm font-medium text-gray-800">{product.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {meta.source_url && (
        <p className="text-xs text-gray-400 mt-8">
          원문: <a href={meta.source_url} target="_blank" rel="noopener noreferrer" className="underline">{meta.source_url}</a>
        </p>
      )}
    </main>
  )
}
