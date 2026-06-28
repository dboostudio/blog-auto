import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'

export const metadata: Metadata = {
  title: '소개',
  description: '모아봄은 지금 화제가 되는 이슈와 살면서 꼭 필요한 실용 정보를 정확하게 정리해 전하는 콘텐츠 블로그입니다.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <PageShell title="모아봄 소개">
      <p>
        <strong>모아봄</strong>은 &ldquo;꿀팁과 재미있는 이야기를 모아 본다&rdquo;는 뜻을 담은 한국어 콘텐츠 블로그입니다.
        매일 쏟아지는 정보 속에서 <strong>지금 화제가 되는 이슈</strong>와 <strong>살면서 꼭 필요한 실용 정보</strong>를
        보기 쉽게 정리해 전합니다.
      </p>

      <h2>다루는 주제</h2>
      <ul>
        <li><strong>화제·트렌드</strong> — 지금 사람들이 가장 많이 찾는 영화·연예·스포츠·사회 이슈를 흥미롭게 정리</li>
        <li><strong>생활·행정 실용정보</strong> — 정부 지원금 신청, 각종 발급·신청 절차 등 &ldquo;어떻게 하지?&rdquo;를 단계별로 안내</li>
      </ul>

      <h2>편집 원칙</h2>
      <p>모아봄은 정보의 정확성을 가장 중요하게 생각합니다.</p>
      <ul>
        <li><strong>사실 확인</strong> — 정부 지원금·통계·인물 정보 등은 공식 출처와 언론 보도를 교차 확인해 작성합니다.</li>
        <li><strong>발행 전 검수</strong> — 모든 글은 발행 전 별도의 사실 검증 단계를 거치며, 확인되지 않은 정보는 게시하지 않습니다.</li>
        <li><strong>기준 시점 명시</strong> — 시점에 따라 달라지는 정보(지원금 마감일, 금액 등)는 기준 시점과 출처를 함께 표기합니다.</li>
      </ul>
      <p>그럼에도 정책·수치는 바뀔 수 있으니, 중요한 신청·결정 전에는 반드시 공식 기관에서 한 번 더 확인하시길 권합니다.</p>

      <h2>문의</h2>
      <p>
        제휴·제보·정정 요청 등 문의는 <a href="/contact">문의 페이지</a>를 통해 연락해 주세요.
      </p>
    </PageShell>
  )
}
