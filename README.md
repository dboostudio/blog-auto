# 모아봄 (moabom)

지금 화제가 되는 이슈와 살면서 꼭 필요한 실용 정보를 정리해 전하는 **자동 생성·발행 한국어 콘텐츠 블로그**.
👉 https://moabom.net

## 무엇인가

- **Next.js(App Router) + Vercel** 정적 블로그. 글은 `posts/*.mdx`.
- 서버(상시 가동)의 **헤드리스 Claude(구독 인증, 무과금)**가 cron으로 하루 2회 글을 생성하고,
  **레드팀 Claude가 사실 검증**한 뒤, 이미지·SEO·쿠팡 배너를 붙여 자동 발행한다.
- 콘텐츠 2트랙: **바이럴**(구글 트렌드 화제) + **니치 how-to**(지원금·신청 등 실용 정보).

## 콘텐츠 파이프라인 (요약)

```
cron → fetch-trends → 작가(Claude) 생성 → 레드팀 사실검증
     → Pexels 이미지 → git push → Vercel 자동배포 → moabom.net
```

## 문서

| 문서 | 내용 |
|------|------|
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | 전체 구조·서버·cron·스크립트·환경변수·트러블슈팅 운영 매뉴얼 |
| [docs/CONTENT-QUALITY-LOOP.md](docs/CONTENT-QUALITY-LOOP.md) | 검수작가 ↔ 작가·레드팀 품질 개선 루프 실행법 |

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 정적 빌드
```

> ⚠️ 이 저장소의 Next.js는 일반 버전과 다를 수 있다. 코드 수정 전 `AGENTS.md` 참고.

## 주요 디렉터리

```
src/app/            라우트(홈·글·정적페이지·sitemap·robots·OG)
src/components/      HomeFeed, CoupangBanner, mdx/YouTube, PageShell ...
src/lib/            posts.ts(글 파싱), site.ts(사이트·쿠팡 설정)
posts/              발행된 글(.mdx)
scripts/            자동 발행 파이프라인(서버에서 실행)
docs/               운영·품질 문서
```
