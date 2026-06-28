import Link from 'next/link'

// 정적 페이지(소개·문의·개인정보처리방침) 공통 레이아웃
export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[800px] mx-auto px-4">
          <div className="flex items-center h-14">
            <Link href="/" className="text-[#03c75a] font-bold text-2xl tracking-tight">🌱 모아봄</Link>
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-8 w-full flex-1">
        <div className="bg-white rounded-lg shadow-sm border border-[#e8e8e8] p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
          <div className="prose prose-gray max-w-none prose-h2:text-lg prose-h2:mt-6 prose-p:leading-7 prose-p:text-gray-700 prose-li:text-gray-700">
            {children}
          </div>
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
