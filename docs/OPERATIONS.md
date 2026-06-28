# 모아봄 운영 매뉴얼 (Operations)

자동 생성·발행 블로그 **모아봄(https://moabom.net)** 의 전체 구조와 운영 방법.

## 전체 구조

```
            ┌──────────── 서버 172.30.1.3 (상시 가동) ────────────┐
 cron 9·14·20시 → auto-publish.sh                                  │
   1. fetch-trends.mjs  (구글 트렌드 KR + 구글뉴스 RSS)            │
   2. fetch-viral.mjs   (YouTube 인기영상, 키 있을 때)            │
   3. 작가: claude -p (구독 인증, 무과금) → posts/*.mdx 생성       │
   4. 레드팀: claude -p → 사실검증, 위험 글 KILL/FIX               │
   5. published 타임스탬프 기록 → inject-images.mjs (Pexels)       │
   6. git commit + push ──────────────────────────────────────────┘
                              │
                       GitHub(dboostudio/blog-auto)
                              │ push 감지
                         Vercel 자동 빌드·배포
                              │
                       moabom.net (Next.js, 정적)
```

## 호스팅 / 도메인

- **호스팅:** Vercel. `main` 브랜치 push → 자동 배포.
- **도메인:** `moabom.net` (Cloudflare 등록·DNS, A레코드 `216.198.79.1`, 프록시 OFF). Vercel에 연결됨.
- **사이트 URL 설정:** `src/lib/site.ts` 의 `SITE.url` (또는 env `NEXT_PUBLIC_SITE_URL`).

## 서버(172.30.1.3) 환경

- **Node:** nvm 설치. 스크립트는 `source ~/.nvm/nvm.sh` 로 로드(cron은 PATH 비어서 auto-publish.sh가 자동 처리).
- **Claude:** `@anthropic-ai/claude-code` 전역 설치. **구독 인증**(`~/.claude/.credentials.json`)이라 글 생성에 API 과금 없음. (setup-token은 redirect 에러 → `claude` 실행 후 `/login`으로 해결)
- **git push 인증:** ed25519 배포키 `~/.ssh/blog_deploy`, repo의 `core.sshCommand`로 지정. GitHub repo에 deploy key(write) 등록. (RSA는 SHA-1 서명 거부됨 → ed25519)
- **git user:** blog-auto-bot
- **cron:** `0 9,14,20 * * *` → `scripts/auto-publish.sh`, 로그 `~/blog-auto/auto-publish.log`

## 환경변수 (`~/blog-auto/.env.local`, git 제외)

| 키 | 용도 | 필수 |
|----|------|------|
| `PEXELS_API_KEY` | 커버 이미지 | 권장 |
| `YOUTUBE_API_KEY` | 바이럴 유튜브 임베드 후보 | 선택 |
| `COUPANG_PARTNERS_ID` | (구) 검색링크용 — 현재 미사용 | - |
| `ANTHROPIC_API_KEY` | (구) API 생성용 — 현재 미사용(구독으로 대체) | - |

> 쿠팡 수익은 **다이나믹 배너 위젯**(trackingCode `AF9076288`, `src/lib/site.ts`의 `COUPANG`)으로 처리. 글마다 링크 삽입 안 함.

## 콘텐츠 전략 (2트랙)

매 실행 글들은 **지금 검색되는 화제** 기반:
- **바이럴** — 구글 트렌드 KR 인기검색어 → 뉴스 WebFetch로 사실확인 → (유튜브 임베드 가능). category=`news`, 슬러그 `viral-*` 또는 `news-*`.
- **니치 how-to** — 구글뉴스 "지원금·신청" 등 실용 뉴스 → 공식출처 확인 → 신청·확인법. category=`howto`, 슬러그 `howto-*`.

지침: `scripts/generate-prompt.md` / 레드팀: `scripts/review-prompt.md`
품질 향상은 → **[CONTENT-QUALITY-LOOP.md](./CONTENT-QUALITY-LOOP.md)**

## 스크립트 (`scripts/`)

| 파일 | 역할 |
|------|------|
| `auto-publish.sh` | 전체 파이프라인(cron 진입점) |
| `fetch-trends.mjs` | 구글 트렌드 KR + 구글뉴스 RSS 수집 |
| `fetch-viral.mjs` | YouTube Data API 인기영상 후보 |
| `generate-prompt.md` | 작가 지침 |
| `review-prompt.md` | 레드팀 검수 지침 |
| `inject-images.mjs` | Pexels 커버 이미지 삽입(슬러그 기반 검색) |

## 글 데이터 형식 (`posts/*.mdx`)

frontmatter: `title, date, published(ISO), description, tags[], category(news|howto), product_keywords[], image_query, cover_image, source_url`.
- **슬러그(파일명)는 반드시 ASCII** (한글 URL은 라우팅 깨짐).
- 본문은 MDX. `<YouTube id="..." />` 임베드 지원.

## 수동 작업

**지금 바로 N개 더 생성** (예: 5개):
```bash
ssh 172.30.1.3 'cd ~/blog-auto && source ~/.nvm/nvm.sh
  set -a; . ./.env.local; set +a
  node scripts/fetch-trends.mjs > scripts/trend-candidates.json
  claude -p "$(cat scripts/generate-prompt.md)\n\n## 오버라이드: 이번에는 5개 작성" \
    --permission-mode acceptEdits --allowedTools "Read Write Edit Glob Grep Bash WebFetch WebSearch"
  # (레드팀 검수 → inject-images → commit/push 는 위 파이프라인 참고)'
```

**로컬 개발:** `npm run dev` (또는 서버 Docker `blog-auto-dev`, 포트 3000).
**배포 확인:** push 후 Vercel 자동 배포. `curl -s https://moabom.net/sitemap.xml | grep -c /posts/` 로 글 수 확인.

## 트러블슈팅

- **push 거부(원격 앞섬):** auto-publish.sh가 `git pull --rebase` 후 재시도. 수동 시 `git pull --rebase origin main` 후 재push.
- **cron이 글을 안 올림:** `crontab -l`, `systemctl is-active cron`, `tail auto-publish.log` 확인.
- **쿠팡 배너 안 보임:** 본인 클릭/광고차단 때문일 수 있음(실제 방문자엔 정상). 본인 반복 클릭 금지(어뷰징).
- **한글 슬러그 404:** 슬러그를 ASCII로. `posts.ts`가 NFC 정규화로 매칭하지만 신규 글은 ASCII 필수.
- **허위 정보 우려:** 레드팀 게이트가 1차 차단. 정부 지원금 글은 발행 후에도 사람이 한 번 더 확인 권장.

## SEO / 수익화 / 법적

- `sitemap.ts`, `robots.ts`, 글별 메타·OG·JSON-LD(Article), `opengraph-image.tsx`(대표 OG), `icon.svg`.
- 구글 서치콘솔 등록·sitemap 제출 완료.
- 필수 페이지: `/about` `/contact` `/privacy`(쿠키·AdSense·쿠팡 고지) + 커스텀 404. 푸터에 링크.
- **애드센스:** 2주 보류(글 15~20개+·색인 후 신청). 자세히는 메모리 `project_adsense_todo`.
- 문의 메일: `moabom.blog@gmail.com`
