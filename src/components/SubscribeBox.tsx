'use client'

import { useState } from 'react'

// 자체 뉴스레터 구독 박스. /api/subscribe 로 POST → 더블 옵트인 확인메일 발송.
export function SubscribeBox({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('') // 허니팟(봇 트랩)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'loading') return
    setState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setState('done')
        setMsg(data.already ? '이미 구독 중이에요. 감사합니다! 🌱' : '확인 메일을 보냈어요. 메일함에서 링크를 눌러주세요 📬')
      } else {
        setState('error')
        setMsg(data.error || '잠시 후 다시 시도해 주세요.')
      }
    } catch {
      setState('error')
      setMsg('네트워크 오류예요. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-[#e8e8e8] shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg">📬</span>
        <h3 className="text-sm font-bold text-gray-900">모아봄 새 글, 메일로 받기</h3>
      </div>

      {state === 'done' ? (
        <p className="text-sm text-[#03883f] leading-relaxed mt-2">{msg}</p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            생활·경제 꿀팁과 화제글을 이메일로. 언제든 구독 해지할 수 있어요.
          </p>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            {/* 허니팟: 사람 눈엔 안 보임 */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소"
              aria-label="이메일 주소"
              className="flex-1 min-w-0 rounded-md border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#03c75a] transition-colors"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="shrink-0 rounded-md bg-[#03c75a] px-4 py-2 text-sm font-bold text-white hover:bg-[#02a94c] transition-colors disabled:opacity-60"
            >
              {state === 'loading' ? '처리 중…' : '구독하기'}
            </button>
          </form>
          {state === 'error' && <p className="text-xs text-red-500 mt-2">{msg}</p>}
        </>
      )}
    </div>
  )
}
