import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'

export const metadata: Metadata = {
  title: '문의',
  description: '모아봄에 대한 제휴, 제보, 정정 요청 등 문의 안내입니다.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <PageShell title="문의하기">
      <p>모아봄을 찾아주셔서 감사합니다. 아래 사항은 이메일로 편하게 문의해 주세요.</p>

      <ul>
        <li><strong>제휴·광고</strong> 문의</li>
        <li><strong>제보·취재 요청</strong></li>
        <li><strong>정정·삭제 요청</strong> — 사실과 다른 내용이 있다면 알려주시면 확인 후 신속히 반영합니다.</li>
        <li>기타 운영 관련 문의</li>
      </ul>

      <h2>이메일</h2>
      <p>
        <a href="mailto:moabom.blog@gmail.com">moabom.blog@gmail.com</a>
      </p>
      <p>보내주신 메일은 확인 후 순차적으로 답변드립니다.</p>
    </PageShell>
  )
}
