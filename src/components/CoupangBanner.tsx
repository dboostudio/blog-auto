import { COUPANG } from '@/lib/site'

/**
 * 쿠팡 파트너스 다이나믹 배너
 * 외부 스크립트(g.js)가 DOM을 직접 조작하므로 iframe(srcDoc)으로 격리해 안전하게 렌더링한다.
 * iframe 내부에서 스크립트가 실행되며 추천 상품 carousel을 표시하고, 클릭/구매 시 수수료가 추적된다.
 */
export function CoupangBanner({
  width = 680,
  height = 140,
}: {
  width?: number
  height?: number
}) {
  const config = JSON.stringify({
    id: COUPANG.id,
    template: COUPANG.template,
    trackingCode: COUPANG.trackingCode,
    width: String(width),
    height: String(height),
    tsource: '',
  })

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden}</style></head>
<body>
<script src="https://ads-partners.coupang.com/g.js"></script>
<script>new PartnersCoupang.G(${config});</script>
</body></html>`

  return (
    <iframe
      srcDoc={srcDoc}
      width={width}
      height={height}
      title="쿠팡 추천 상품"
      scrolling="no"
      loading="lazy"
      className="w-full max-w-full border-0"
      style={{ maxWidth: width }}
    />
  )
}
