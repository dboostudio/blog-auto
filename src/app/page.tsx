import { getAllPosts } from '@/lib/posts'
import { HomeFeed } from '@/components/HomeFeed'

export default function Home() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <HomeFeed posts={posts} />

      <footer className="mt-8 py-6 text-center text-xs text-gray-400 border-t border-[#e5e5e5] bg-white">
        © 2026 모아봄 · 꿀팁과 재미있는 이야기를 모아 봅니다
      </footer>
    </div>
  )
}
