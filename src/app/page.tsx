import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const CATEGORIES = ['전체', '생활꿀팁', '레시피', '건강', '해외토픽', '황당']

export default function Home() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="text-[#03c75a] font-bold text-2xl tracking-tight">
              🌱 모아봄
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
            <div className="bg-white rounded-lg mb-3 overflow-hidden shadow-sm border border-[#e8e8e8]">
              <Link href={`/posts/${posts[0].slug}`} className="group block">
                <div className="flex">
                  {/* 썸네일 영역 */}
                  <div className="shrink-0 w-44 bg-gradient-to-br from-[#03c75a] to-[#02a94c] flex items-center justify-center text-6xl overflow-hidden">
                    {posts[0].cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={posts[0].cover_image} alt={posts[0].title} className="w-full h-full object-cover" />
                    ) : (
                      posts[0].tags?.[0] === '동물' ? '🐾' :
                      posts[0].tags?.[0] === '사건사고' ? '🚨' :
                      posts[0].tags?.[0] === '황당' ? '😱' : '🌍'
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold tracking-wide">HOT</span>
                      {posts[0].tags?.[0] && (
                        <span className="text-sm text-[#03c75a] font-semibold">{posts[0].tags[0]}</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#03c75a] transition-colors leading-snug mb-3">
                      {posts[0].title}
                    </h2>
                    <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-2 mb-4">{posts[0].description}</p>
                    <span className="text-sm text-gray-500 font-medium">
                      {formatDistanceToNow(new Date(posts[0].date), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* 나머지 글 목록 */}
          <div className="bg-white rounded-lg divide-y divide-[#eee] shadow-sm border border-[#e8e8e8]">
            {posts.slice(1).map(post => (
              <Link key={post.slug} href={`/posts/${post.slug}`} className="group flex items-start gap-4 p-5 hover:bg-[#f8fdfa] transition-colors">
                {/* 썸네일 자리 (없으면 태그 색상 블록) */}
                <div className="shrink-0 w-24 h-20 rounded-md bg-gradient-to-br from-[#eafaf2] to-[#c8f2de] flex items-center justify-center text-3xl overflow-hidden">
                  {post.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    post.category === 'howto' ? '📝' :
                    post.tags?.[0] === '동물' ? '🐾' :
                    post.tags?.[0] === '사건사고' ? '🚨' :
                    post.tags?.[0] === '황당' ? '😱' : '🌍'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {post.category === 'howto' ? (
                      <span className="text-[11px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">꿀팁</span>
                    ) : (
                      <span className="text-[11px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded font-semibold">이슈</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#03c75a] transition-colors line-clamp-2 leading-snug mb-1.5">
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

            {posts.length <= 1 && (
              <div className="p-10 text-center text-gray-400 text-sm">
                더 많은 뉴스가 곧 업데이트됩니다.
              </div>
            )}
          </div>
        </section>

        {/* 사이드바 */}
        <aside className="w-[280px] shrink-0 hidden lg:block">
          {/* 많이 본 뉴스 */}
          <div className="bg-white rounded-lg mb-3 shadow-sm border border-[#e8e8e8]">
            <div className="px-4 py-3 border-b-2 border-[#03c75a]">
              <h3 className="text-base font-bold text-gray-900">많이 본 뉴스</h3>
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

          {/* 태그 클라우드 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#e8e8e8]">
            <div className="px-4 py-3 border-b-2 border-[#03c75a]">
              <h3 className="text-base font-bold text-gray-900">인기 태그</h3>
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
        © 2026 모아봄 · 꿀팁과 재미있는 이야기를 모아 봅니다
      </footer>
    </div>
  )
}
