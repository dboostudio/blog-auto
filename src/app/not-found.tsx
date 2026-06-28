import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[800px] mx-auto px-4">
          <div className="flex items-center h-14">
            <Link href="/" className="text-[#03c75a] font-bold text-2xl tracking-tight">🌱 모아봄</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없어요</h1>
          <p className="text-gray-500 mb-8">
            주소가 바뀌었거나 삭제된 글일 수 있어요.<br />
            홈에서 다른 글을 둘러보세요.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#03c75a] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#02a94c] transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-500 border-t border-[#e5e5e5] bg-white">
        <div className="flex justify-center gap-4 mb-2">
          <Link href="/about" className="hover:text-[#03c75a]">소개</Link>
          <Link href="/contact" className="hover:text-[#03c75a]">문의</Link>
          <Link href="/privacy" className="hover:text-[#03c75a]">개인정보처리방침</Link>
        </div>
        © 2026 모아봄 · 꿀팁과 재미있는 이야기를 모아 봅니다
      </footer>
    </div>
  )
}
