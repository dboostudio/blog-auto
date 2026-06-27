'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { PostMeta } from '@/lib/posts'

// 카테고리 → 매칭 키워드 (태그/제목에 포함되면 해당 카테고리로 분류)
const CATEGORY_FILTERS: { label: string; match: (p: PostMeta) => boolean }[] = [
  { label: '전체', match: () => true },
  { label: '생활꿀팁', match: p => p.category === 'howto' && hasAny(p, ['청소', '생활', '꿀팁', '곰팡이', '정리', '수납']) },
  { label: '레시피', match: p => hasAny(p, ['레시피', '요리', '김치찌개', '집밥', '음식', '맛']) },
  { label: '건강', match: p => hasAny(p, ['건강', '운동', '홈트', '수면', '다이어트', '뱃살']) },
  { label: '해외토픽', match: p => p.category === 'news' || hasAny(p, ['해외토픽', '해외']) },
  { label: '황당', match: p => hasAny(p, ['황당', '충격', '경악']) },
]

function hasAny(p: PostMeta, keywords: string[]) {
  const hay = [p.title, ...(p.tags || [])].join(' ')
  return keywords.some(k => hay.includes(k))
}

function thumbEmoji(p: PostMeta) {
  if (p.category === 'howto') return '📝'
  if (p.tags?.[0] === '동물') return '🐾'
  if (p.tags?.[0] === '황당') return '😱'
  return '🌍'
}

export function HomeFeed({ posts }: { posts: PostMeta[] }) {
  const [cat, setCat] = useState('전체')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const f = CATEGORY_FILTERS.find(c => c.label === cat) || CATEGORY_FILTERS[0]
    let list = posts.filter(f.match)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        [p.title, p.description, ...(p.tags || [])].join(' ').toLowerCase().includes(q)
      )
    }
    return list
  }, [posts, cat, query])

  const headline = filtered[0]
  const rest = filtered.slice(1)

  return (
    <>
      {/* 상단 헤더 (로고 + 검색) */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-3">
            <Link href="/" className="text-[#03c75a] font-bold text-2xl tracking-tight shrink-0">
              🌱 모아봄
            </Link>
            <div className="flex items-center gap-1 bg-[#f5f5f5] border border-[#e0e0e0] rounded-full px-3 py-1.5 w-full max-w-xs focus-within:border-[#03c75a] transition-colors">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
                placeholder="모아봄 검색"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="검색어 지우기">
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 카테고리 탭 */}
      <nav className="bg-white border-b border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto px-4">
          <ul className="flex gap-0 text-sm overflow-x-auto">
            {CATEGORY_FILTERS.map(c => (
              <li key={c.label}>
                <button
                  onClick={() => setCat(c.label)}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    cat === c.label
                      ? 'border-[#03c75a] text-[#03c75a]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-4 py-4 flex gap-4">
        <section className="flex-1 min-w-0">
          {/* 검색/필터 결과 안내 */}
          {(query || cat !== '전체') && (
            <p className="text-sm text-gray-500 mb-3 px-1">
              {query ? `"${query}" 검색 결과` : `${cat}`} · {filtered.length}개
            </p>
          )}

          {/* 헤드라인 */}
          {headline && (
            <div className="bg-white rounded-lg mb-3 overflow-hidden shadow-sm border border-[#e8e8e8]">
              <Link href={`/posts/${headline.slug}`} className="group block">
                <div className="flex flex-col sm:flex-row">
                  <div className="shrink-0 w-full h-48 sm:h-auto sm:w-44 bg-gradient-to-br from-[#03c75a] to-[#02a94c] flex items-center justify-center text-6xl overflow-hidden">
                    {headline.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={headline.cover_image} alt={headline.title} className="w-full h-full object-cover" />
                    ) : thumbEmoji(headline)}
                  </div>
                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold tracking-wide">HOT</span>
                      {headline.tags?.[0] && (
                        <span className="text-sm text-[#03c75a] font-semibold">{headline.tags[0]}</span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#03c75a] transition-colors leading-snug mb-3">
                      {headline.title}
                    </h2>
                    <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-2 mb-4">{headline.description}</p>
                    <span className="text-sm text-gray-500 font-medium">
                      {formatDistanceToNow(new Date(headline.date), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* 목록 */}
          <div className="bg-white rounded-lg divide-y divide-[#eee] shadow-sm border border-[#e8e8e8]">
            {rest.map(post => (
              <Link key={post.slug} href={`/posts/${post.slug}`} className="group flex items-start gap-4 p-4 sm:p-5 hover:bg-[#f8fdfa] transition-colors">
                <div className="shrink-0 w-24 h-20 rounded-md bg-gradient-to-br from-[#eafaf2] to-[#c8f2de] flex items-center justify-center text-3xl overflow-hidden">
                  {post.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  ) : thumbEmoji(post)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {post.category === 'howto' ? (
                      <span className="text-[11px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">꿀팁</span>
                    ) : (
                      <span className="text-[11px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded font-semibold">이슈</span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#03c75a] transition-colors line-clamp-2 leading-snug mb-1.5">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">{post.description}</p>
                  <div className="flex items-center gap-2">
                    {post.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs text-[#03c75a] font-medium">#{tag}</span>
                    ))}
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(post.date), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm">
                {query ? `"${query}"에 대한 결과가 없어요.` : '이 카테고리에는 아직 글이 없어요.'}
              </div>
            )}
          </div>
        </section>

        {/* 사이드바 */}
        <aside className="w-[280px] shrink-0 hidden lg:block">
          <div className="bg-white rounded-lg mb-3 shadow-sm border border-[#e8e8e8]">
            <div className="px-4 py-3 border-b-2 border-[#03c75a]">
              <h3 className="text-base font-bold text-gray-900">인기 글</h3>
            </div>
            <ul className="p-4 space-y-3.5">
              {posts.slice(0, 5).map((post, i) => (
                <li key={post.slug}>
                  <Link href={`/posts/${post.slug}`} className="flex gap-3 group items-start">
                    <span className={`text-lg font-bold shrink-0 leading-snug ${
                      i === 0 ? 'text-red-500' : i === 1 ? 'text-orange-500' : i === 2 ? 'text-[#03c75a]' : 'text-gray-400'
                    }`}>{i + 1}</span>
                    <span className="text-sm text-gray-700 group-hover:text-[#03c75a] line-clamp-2 leading-snug font-medium">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#e8e8e8]">
            <div className="px-4 py-3 border-b-2 border-[#03c75a]">
              <h3 className="text-base font-bold text-gray-900">인기 태그</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {[...new Set(posts.flatMap(p => p.tags || []))].slice(0, 12).map(tag => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); setCat('전체') }}
                  className="text-xs bg-[#f0faf5] text-[#03c75a] border border-[#c8f2de] px-2 py-1 rounded-full hover:bg-[#03c75a] hover:text-white transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </>
  )
}
