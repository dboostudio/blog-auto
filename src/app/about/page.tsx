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

      <h2>누가 만드나요</h2>
      <p>
        모아봄은 <strong>개인이 직접 기획·운영하는 1인 콘텐츠 블로그</strong>입니다. 특정 기업·기관의 후원이나
        광고주의 요청으로 특정 내용을 쓰지 않으며, 주제 선정과 편집은 운영자가 독립적으로 결정합니다.
        문의·정정 요청은 <a href="/contact">문의 페이지</a>로 받습니다.
      </p>

      <h2>어떻게 만드나요 (제작·검증 과정)</h2>
      <p>
        모아봄은 <strong>AI 도구를 활용해 초안을 작성</strong>하고, 아래 검증 절차를 거쳐 발행합니다.
        이 사실을 숨기지 않고 밝히는 것이 독자에 대한 예의라고 생각합니다.
      </p>
      <ul>
        <li><strong>1차: 자료 조사</strong> — 정부·공공기관 공식 안내와 언론 보도 등 <strong>원문을 직접 확인</strong>해 사실을 수집합니다.</li>
        <li><strong>2차: 사실 검증(레드팀)</strong> — 발행 전 별도의 검증 단계에서 금액·날짜·대상·절차 등 핵심 사실을 <strong>출처와 다시 대조</strong>합니다. 확인되지 않은 정보는 싣지 않거나, 글 자체를 발행하지 않습니다.</li>
        <li><strong>3차: 출처·기준 시점 표기</strong> — 시점에 따라 달라지는 정보(마감일·금액·요율)는 기준 시점과 출처 링크를 함께 남깁니다.</li>
        <li><strong>발행 후 관리</strong> — 정책이 바뀌거나 오류가 확인되면 본문을 수정하고, 수명이 다한 글은 정리합니다.</li>
      </ul>

      <h2>편집 원칙</h2>
      <ul>
        <li><strong>정확성 우선</strong> — 조회수를 위해 확인되지 않은 내용을 단정하지 않습니다.</li>
        <li><strong>과장·낚시 금지</strong> — 제목이 본문에서 지키지 못할 약속을 하지 않도록 합니다.</li>
        <li><strong>투자·의료·법률 정보</strong> — 특정 상품 권유나 단정적 조언을 하지 않으며, 최종 판단과 책임은 독자 본인에게 있음을 밝힙니다.</li>
      </ul>
      <p>그럼에도 정책·수치는 바뀔 수 있으니, 중요한 신청·결정 전에는 반드시 공식 기관에서 한 번 더 확인하시길 권합니다.</p>

      <h2>정정 요청</h2>
      <p>
        사실과 다른 내용을 발견하셨다면 <a href="/contact">문의 페이지</a>로 알려주세요.
        확인 후 신속히 수정하고, 필요한 경우 수정 사실을 본문에 밝힙니다.
      </p>
    </PageShell>
  )
}
