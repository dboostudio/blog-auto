import type { NextConfig } from "next";

// 슬러그 정리(2026-06-29): 옛 prefix 포함 URL → 새 키워드 URL 영구 리다이렉트
const postRedirects = [
    { source: "/posts/viral-lotto-1230-result-1782900000000", destination: "/posts/lotto-1230-result", permanent: true },
    { source: "/posts/viral-hanwha-roh-sihwan-5game-hr-1782950000000", destination: "/posts/hanwha-roh-sihwan-5game-hr", permanent: true },
    { source: "/posts/viral-easy-read-judgment-1783001000", destination: "/posts/easy-read-judgment", permanent: true },
    { source: "/posts/howto-climate-card-refund-1782963100000", destination: "/posts/climate-card-refund", permanent: true },
    { source: "/posts/viral-han-hyeyeon-diet-1782975000", destination: "/posts/han-hyeyeon-diet", permanent: true },
    { source: "/posts/howto-online-move-in-report-1782811400000", destination: "/posts/online-move-in-report", permanent: true },
    { source: "/posts/howto-energy-voucher-2026-1782900100000", destination: "/posts/energy-voucher-2026", permanent: true },
    { source: "/posts/viral-gta6-price-release-1782642672", destination: "/posts/gta6-price-release", permanent: true },
    { source: "/posts/viral-korea-worldcup-eliminated-1782963000000", destination: "/posts/korea-worldcup-eliminated", permanent: true },
    { source: "/posts/viral-hong-myungbo-resign-1782999800", destination: "/posts/hong-myungbo-resign", permanent: true },
    { source: "/posts/viral-binance-kospi-leverage-1782970000000", destination: "/posts/binance-kospi-leverage", permanent: true },
    { source: "/posts/howto-national-scholarship-2nd-1782976000", destination: "/posts/national-scholarship-2nd", permanent: true },
    { source: "/posts/news-spiderman-brand-new-day-trailer-1782811500000", destination: "/posts/spiderman-brand-new-day-trailer", permanent: true },
    { source: "/posts/howto-high-oil-price-relief-1782970100000", destination: "/posts/high-oil-price-relief", permanent: true },
    { source: "/posts/howto-gov24-minor-child-proxy-1782999500", destination: "/posts/gov24-minor-child-proxy", permanent: true },
    { source: "/posts/howto-income-tax-refund-2026-1783001500", destination: "/posts/income-tax-refund-2026", permanent: true },
    { source: "/posts/viral-korea-submarine-canada-1782999000", destination: "/posts/korea-submarine-canada", permanent: true },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.30.1.3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: '**.coupangcdn.com' },
    ],
  },
  async redirects() {
    return postRedirects;
  },
};

export default nextConfig;
