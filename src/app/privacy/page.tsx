import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '모아봄의 개인정보처리방침 및 쿠키·광고 데이터 수집에 대한 안내입니다.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <PageShell title="개인정보처리방침">
      <p>
        모아봄(이하 &ldquo;사이트&rdquo;)은 이용자의 개인정보를 소중히 여기며, 아래와 같이 개인정보 처리방침을 안내합니다.
        본 방침은 <strong>2026년 6월 28일</strong>부터 적용됩니다.
      </p>

      <h2>1. 수집하는 정보</h2>
      <p>
        사이트는 회원가입 기능이 없으며, 이용자의 이름·연락처 등 <strong>개인을 직접 식별하는 정보를 수집하지 않습니다.</strong>
        다만 광고 및 통계 목적으로 아래 &lsquo;쿠키&rsquo; 항목과 같은 비식별 정보가 제3자에 의해 수집될 수 있습니다.
      </p>

      <h2>2. 쿠키 및 광고</h2>
      <p>
        사이트는 제3자 광고 및 제휴 서비스를 이용하며, 이 과정에서 쿠키(cookie)가 사용될 수 있습니다.
      </p>
      <ul>
        <li>
          <strong>Google AdSense 등 제3자 광고</strong> — Google을 포함한 제3자 공급업체는 쿠키를 사용해 이용자의 방문 기록을
          기반으로 맞춤 광고를 제공할 수 있습니다. 이용자는{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google 광고 설정</a>에서
          맞춤 광고를 거부할 수 있으며,{' '}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>에서
          제3자 공급업체의 쿠키 사용을 거부할 수 있습니다.
        </li>
        <li>
          <strong>쿠팡 파트너스</strong> — 사이트는 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받으며,
          제휴 링크 클릭 시 쿠팡의 쿠키 정책이 적용됩니다.
        </li>
      </ul>
      <p>
        이용자는 웹브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. 다만 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
      </p>

      <h2>3. 외부 콘텐츠 및 링크</h2>
      <p>
        사이트는 Pexels 등의 이미지, YouTube 동영상 임베드, 외부 뉴스·공식 기관으로의 링크를 포함할 수 있습니다.
        해당 외부 서비스에는 각 서비스의 개인정보처리방침이 적용되며, 사이트는 외부 사이트의 정책에 책임지지 않습니다.
      </p>

      <h2>4. 정보의 보관 및 제3자 제공</h2>
      <p>
        사이트는 이용자의 개인정보를 직접 저장하거나 제3자에게 판매·제공하지 않습니다.
        광고·통계 목적의 비식별 데이터는 해당 제3자 서비스의 정책에 따라 처리됩니다.
      </p>

      <h2>5. 문의</h2>
      <p>
        개인정보 관련 문의는 <a href="mailto:moabom.blog@gmail.com">moabom.blog@gmail.com</a> 으로 연락해 주세요.
      </p>
    </PageShell>
  )
}
