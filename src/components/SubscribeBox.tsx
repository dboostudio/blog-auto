import { NEWSLETTER } from '@/lib/site'

// Buttondown 이메일 구독 박스. 서버 렌더되는 순수 폼(별도 JS 불필요).
// username 미설정 시 아무것도 렌더하지 않는다.
export function SubscribeBox({ compact = false }: { compact?: boolean }) {
  const user = NEWSLETTER.buttondownUsername
  if (!user) return null

  const action = `https://buttondown.com/api/emails/embed-subscribe/${user}`

  return (
    <div className={`bg-white rounded-lg border border-[#e8e8e8] shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg">📬</span>
        <h3 className="text-sm font-bold text-gray-900">모아봄 새 글, 메일로 받기</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        생활·경제 꿀팁과 화제글을 이메일로. 언제든 구독 해지할 수 있어요.
      </p>
      <form
        action={action}
        method="post"
        target="_blank"
        className="flex flex-col sm:flex-row gap-2"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="이메일 주소"
          aria-label="이메일 주소"
          className="flex-1 min-w-0 rounded-md border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#03c75a] transition-colors"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-[#03c75a] px-4 py-2 text-sm font-bold text-white hover:bg-[#02a94c] transition-colors"
        >
          구독하기
        </button>
      </form>
    </div>
  )
}
