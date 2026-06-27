// 사이트 전역 설정 (SEO 메타에 사용)
export const SITE = {
  name: '세계황당뉴스',
  title: '세계황당뉴스 | 해외 토픽과 생활 꿀팁',
  description:
    '믿기 힘든 해외 사건사고부터 바로 써먹는 생활 꿀팁·레시피까지. 매일 새로운 이야기를 전합니다.',
  // 배포 도메인 (커스텀 도메인 붙이면 NEXT_PUBLIC_SITE_URL 로 교체)
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://blog-auto-phi.vercel.app',
  locale: 'ko_KR',
}

// 쿠팡 파트너스 다이나믹 배너 설정
export const COUPANG = {
  id: 1000897,
  trackingCode: 'AF9076288',
  template: 'carousel',
}
