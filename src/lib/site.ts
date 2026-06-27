// 사이트 전역 설정 (SEO 메타에 사용)
export const SITE = {
  name: '모아봄',
  title: '모아봄 | 꿀팁과 재미있는 이야기',
  description:
    '알아두면 쓸모있는 생활 꿀팁·레시피부터 믿기 힘든 해외 토픽까지. 매일 새로운 이야기를 모아 봅니다.',
  // 배포 도메인
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://moabom.net',
  locale: 'ko_KR',
}

// 쿠팡 파트너스 다이나믹 배너 설정
export const COUPANG = {
  id: 1000897,
  trackingCode: 'AF9076288',
  template: 'carousel',
}
