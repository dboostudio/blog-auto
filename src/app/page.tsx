import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const CATEGORIES = ['전체', '사건사고', '동물', '해외토픽', '황당', '미스터리']

export default function Home() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="text-[#03c75a] font-bold text-2xl tracking-tight">
              🌍 세계황당뉴스
            </Link>
            <div className="flex items-center gap-1 bg-[#f5f5f5] border border-[#e0e0e0] rounded-sm px-3 py-1.5 w-64">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input className="bg-transparent text-sm outline-none w-full text-gray-600 placeholder-gray-400" placeholder="뉴스 검색" />
            </div>
          </div>
        </div>
      </header>

      {/* 카테고리 탭 */}
      <nav className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1100px] mx-auto px-4">
          <ul className="flex gap-0 text-sm">
            {CATEGORIES.map((cat, i) => (
              <li key={cat}>
                <button className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  i === 0
                    ? 'border-[#03c75a] text-[#03c75a]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}>
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 본문 */}
      <main className="max-w-[1100px] mx-auto px-4 py-4 flex gap-4">
        {/* 뉴스 목록 */}
        <section className="flex-1 min-w-0">
          {/* 헤드라인 배너 (첫 번째 글) */}
          {posts[0] && (
            <div className="bg-white rounded mb-2 overflow-hidden">
              <Link href={`/posts/${posts[0].slug}`} className="group block p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-semibold">HOT</span>
                  {posts[0].tags?.[0] && (
                    <span className="text-xs text-[#03c75a] font-medium">{posts[0].tags[0]}</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#03c75a] transition-colors leading-snug mb-2">
                  {posts[0].title}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{posts[0].description}</p>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(posts[0].date), { addSuffix: true, locale: ko })}
                </span>
              </Link>
            </div>
          )}

          {/* 나머지 글 목록 */}
          <div className="bg-white rounded divide-y divide-[#f0f0f0]">
            {posts.slice(1).map(post => (
              <Link key={post.slug} href={`/posts/${post.slug}`} className="group flex items-start gap-4 p-4 hover:bg-[#fafafa] transition-colors">
                {/* 썸네일 자리 (없으면 태그 색상 블록) */}
                <div className="shrink-0 w-20 h-16 rounded bg-gradient-to-br from-[#eafaf2] to-[#c8f2de] flex items-center justify-center text-2xl">
                  {post.tags?.[0] === '동물' ? '🐾' :
                   post.tags?.[0] === '사건사고' ? '🚨' :
                   post.tags?.[0] === '황당' ? '😱' : '🌍'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#03c75a] transition-colors line-clamp-2 leading-snug mb-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{post.description}</p>
                  <div className="flex items-center gap-2">
                    {post.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                    ))}
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.date), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {posts.length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm">
                아직 게시된 뉴스가 없습니다.
              </div>
            )}
          </div>
        </section>

        {/* 사이드바 */}
        <aside className="w-[280px] shrink-0 hidden lg:block">
          {/* 많이 본 뉴스 */}
          <div className="bg-white rounded mb-3">
            <div className="px-4 py-3 border-b border-[#f0f0f0]">
              <h3 className="text-sm font-bold text-gray-800">많이 본 뉴스</h3>
            </div>
            <ul className="p-4 space-y-3">
              {posts.slice(0, 5).map((post, i) => (
                <li key={post.slug}>
                  <Link href={`/posts/${post.slug}`} className="flex gap-3 group">
                    <span className={`text-lg font-bold shrink-0 ${
                      i === 0 ? 'text-red-500' : i === 1 ? 'text-orange-400' : i === 2 ? 'text-yellow-500' : 'text-gray-300'
                    }`}>{i + 1}</span>
                    <span className="text-xs text-gray-700 group-hover:text-[#03c75a] line-clamp-2 leading-snug">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 태그 클라우드 */}
          <div className="bg-white rounded">
            <div className="px-4 py-3 border-b border-[#f0f0f0]">
              <h3 className="text-sm font-bold text-gray-800">인기 태그</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {[...new Set(posts.flatMap(p => p.tags || []))].slice(0, 12).map(tag => (
                <span key={tag} className="text-xs bg-[#f0faf5] text-[#03c75a] border border-[#c8f2de] px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* 푸터 */}
      <footer className="mt-8 py-6 text-center text-xs text-gray-400 border-t border-[#e5e5e5] bg-white">
        © 2024 세계황당뉴스 · 해외 뉴스 큐레이션 서비스
      </footer>
    </div>
  )
}
