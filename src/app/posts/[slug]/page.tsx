import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE } from '@/lib/site'
import { CoupangBanner } from '@/components/CoupangBanner'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  let meta
  try {
    meta = getPostBySlug(slug).meta
  } catch {
    return {}
  }

  const url = `${SITE.url}/posts/${slug}`
  const images = meta.cover_image ? [meta.cover_image] : undefined

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.tags,
    alternates: { canonical: `/posts/${slug}` },
    openGraph: {
      type: 'article',
      title: meta.title,
      description: meta.description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: meta.date,
      tags: meta.tags,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images,
    },
  }
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
  const relatedPosts = getAllPosts().filter(p => p.slug !== slug).slice(0, 4)

  // 구조화 데이터 (Google 리치 결과용 Article 스키마)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    image: meta.cover_image ? [meta.cover_image] : undefined,
    keywords: meta.tags?.join(', '),
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/posts/${slug}` },
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link href="/" className="text-[#03c75a] font-bold text-xl">🌍 세계황당뉴스</Link>
            <span className="text-gray-300">›</span>
            {meta.tags?.[0] && <span className="text-sm text-gray-500">{meta.tags[0]}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-5 flex gap-4">
        {/* 기사 본문 */}
        <article className="flex-1 min-w-0">
          <div className="bg-white rounded p-6 mb-3">
            {/* 카테고리 + 제목 */}
            <div className="flex items-center gap-2 mb-3">
              {meta.tags?.map(tag => (
                <span key={tag} className="text-xs bg-[#f0faf5] text-[#03c75a] border border-[#c8f2de] px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">
              {meta.title}
            </h1>

            {/* 메타 */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0] text-xs text-gray-400">
              <span>세계황당뉴스</span>
              <span>·</span>
              <span>{format(new Date(meta.date), 'yyyy.MM.dd HH:mm')}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(meta.date), { addSuffix: true, locale: ko })}</span>
            </div>

            {/* 커버 이미지 */}
            {meta.cover_image && (
              <figure className="mt-6 -mx-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={meta.cover_image} alt={meta.title} className="w-full rounded-lg object-cover max-h-[420px]" />
                {meta.cover_image_credit && (
                  <figcaption className="text-xs text-gray-400 mt-2 text-right">사진: {meta.cover_image_credit} / Pexels</figcaption>
                )}
              </figure>
            )}

            {/* 본문 */}
            <div className="prose prose-gray max-w-none mt-6 prose-headings:font-bold prose-h2:text-lg prose-p:leading-8 prose-p:text-gray-700">
              <MDXRemote
                source={content}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </div>

            {/* 원문 */}
            {meta.source_url && (
              <div className="mt-6 pt-4 border-t border-[#f0f0f0]">
                <a href={meta.source_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#03c75a]">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  원문 보기
                </a>
              </div>
            )}
          </div>

          {/* 쿠팡 파트너스 추천 상품 (다이나믹 배너) */}
          <div className="bg-white rounded p-5 mb-3">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-500 px-2 py-0.5 rounded text-xs font-semibold">AD</span>
              오늘의 추천 상품
            </h3>
            <div className="flex justify-center">
              <CoupangBanner width={680} height={140} />
            </div>
            {/* 공정거래위원회 의무 고지 문구 */}
            <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
              이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
          </div>

          {/* 관련 뉴스 */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-[#f0f0f0]">관련 뉴스</h3>
              <ul className="divide-y divide-[#f5f5f5]">
                {relatedPosts.map(p => (
                  <li key={p.slug}>
                    <Link href={`/posts/${p.slug}`} className="flex gap-3 py-3 group">
                      <div className="shrink-0 w-16 h-12 rounded bg-[#f0faf5] flex items-center justify-center text-xl">🌍</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-[#03c75a] line-clamp-2 leading-snug">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(p.date), { addSuffix: true, locale: ko })}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        {/* 사이드바 */}
        <aside className="w-[260px] shrink-0 hidden lg:block">
          <div className="bg-white rounded sticky top-4">
            <div className="px-4 py-3 border-b border-[#f0f0f0]">
              <h3 className="text-sm font-bold text-gray-800">많이 본 뉴스</h3>
            </div>
            <ul className="p-4 space-y-3">
              {getAllPosts().slice(0, 5).map((p, i) => (
                <li key={p.slug}>
                  <Link href={`/posts/${p.slug}`} className="flex gap-3 group">
                    <span className={`text-lg font-bold shrink-0 ${
                      i === 0 ? 'text-red-500' : i === 1 ? 'text-orange-400' : i === 2 ? 'text-yellow-500' : 'text-gray-300'
                    }`}>{i + 1}</span>
                    <span className="text-xs text-gray-700 group-hover:text-[#03c75a] line-clamp-2 leading-snug">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      <footer className="mt-8 py-6 text-center text-xs text-gray-400 border-t border-[#e5e5e5] bg-white">
        © 2024 세계황당뉴스 · 해외 뉴스 큐레이션 서비스
      </footer>
    </div>
  )
}
