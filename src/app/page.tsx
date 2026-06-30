import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { HomeFeed } from '@/components/HomeFeed'

export default function Home() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <HomeFeed posts={posts} />

      <footer className="mt-8 py-6 text-center text-xs text-gray-500 border-t border-[#e5e5e5] bg-white">
        <div className="flex justify-center gap-4 mb-2">
          <Link href="/about" className="hover:text-[#03c75a]">소개</Link>
          <Link href="/contact" className="hover:text-[#03c75a]">문의</Link>
          <Link href="/privacy" className="hover:text-[#03c75a]">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-[#03c75a]">이용약관</Link>
        </div>
        © 2026 모아봄 · 꿀팁과 재미있는 이야기를 모아 봅니다
      </footer>
    </div>
  )
}
