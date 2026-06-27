import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function Home() {
  const posts = getAllPosts()

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">🌍 세계 황당 뉴스</h1>
        <p className="text-gray-500 mt-2">믿기 힘든 해외 사건사고 모음</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-gray-400">아직 게시된 글이 없습니다.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map(post => (
            <li key={post.slug} className="border-b pb-6">
              <Link href={`/posts/${post.slug}`} className="group">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {format(new Date(post.date), 'yyyy년 M월 d일', { locale: ko })}
                </p>
                <p className="text-gray-600 mt-2 line-clamp-2">{post.description}</p>
                {post.tags?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
