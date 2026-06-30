import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'

export const metadata: Metadata = {
  title: '이용약관',
  description: '모아봄 서비스 이용약관 및 책임의 한계에 대한 안내입니다.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <PageShell title="이용약관">
      <p>본 약관은 모아봄(이하 &ldquo;사이트&rdquo;)이 제공하는 콘텐츠 및 서비스 이용에 관한 조건을 규정합니다. 본 약관은 <strong>2026년 6월 30일</strong>부터 적용됩니다.</p>

      <h2>1. 서비스의 목적</h2>
      <p>
        사이트는 화제가 되는 이슈와 생활·행정 실용 정보를 정리해 제공하는 것을 목적으로 합니다.
        제공되는 모든 콘텐츠는 <strong>일반적인 정보 제공 목적</strong>이며, 법률·세무·의료·금융 등의 전문적인 자문을 대체하지 않습니다.
      </p>

      <h2>2. 정보의 정확성과 책임의 한계</h2>
      <p>
        사이트는 콘텐츠의 정확성을 위해 공식 출처와 언론 보도를 확인해 작성하지만, 정책·금액·일정 등은 시점에 따라 변경될 수 있습니다.
      </p>
      <ul>
        <li>중요한 신청·결정 전에는 반드시 <strong>공식 기관의 최신 정보를 직접 확인</strong>하시기 바랍니다.</li>
        <li>사이트의 정보를 바탕으로 한 이용자의 판단과 행위에 대해 사이트는 법적 책임을 지지 않습니다.</li>
        <li>사이트에 포함된 외부 링크·임베드(뉴스, 영상 등)의 내용에 대해서는 책임지지 않습니다.</li>
      </ul>

      <h2>3. 저작권</h2>
      <p>
        사이트가 직접 작성한 콘텐츠의 저작권은 사이트에 있습니다. 무단 복제·배포를 금합니다.
        사이트에 사용된 이미지·영상 등 외부 자료는 각 제공처(Pexels, YouTube 등)의 라이선스를 따릅니다.
      </p>

      <h2>4. 광고 및 제휴</h2>
      <p>
        사이트는 제3자 광고 및 제휴 마케팅(쿠팡 파트너스 등)을 포함할 수 있으며, 이에 따라 일정액의 수수료를 제공받습니다.
        자세한 내용은 <a href="/privacy">개인정보처리방침</a>을 참고해 주세요.
      </p>

      <h2>5. 약관의 변경</h2>
      <p>
        본 약관은 필요 시 변경될 수 있으며, 변경 시 본 페이지를 통해 공지합니다. 변경 후에도 사이트를 계속 이용하면 변경된 약관에 동의한 것으로 봅니다.
      </p>

      <h2>6. 문의</h2>
      <p>
        약관 관련 문의는 <a href="mailto:moabom.blog@gmail.com">moabom.blog@gmail.com</a> 으로 연락해 주세요.
      </p>
    </PageShell>
  )
}
