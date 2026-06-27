#!/usr/bin/env bash
#
# 자동 발행 스크립트 (헤드리스 Claude 구독 인증 사용, API 과금 없음)
# Claude가 글 생성 → 쿠팡 링크 삽입 → 커밋 → 푸시 → Vercel 자동배포
#
# cron 예시 (매일 09:00):
#   0 9 * * * /home/dboo/blog-auto/scripts/auto-publish.sh >> /home/dboo/blog-auto/auto-publish.log 2>&1

set -euo pipefail

REPO_DIR="$HOME/blog-auto"
cd "$REPO_DIR"

# nvm 환경 로드 (cron은 PATH가 비어있음)
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# .env.local 로드 (COUPANG_PARTNERS_ID, PEXELS_API_KEY 등)
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

echo "=========================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 자동 발행 시작"
echo "=========================================="

# 1. 최신 코드 동기화
git pull --quiet origin main || echo "git pull 경고 (계속 진행)"

# 2. 발행 전 파일 수 기록
BEFORE=$(find posts -name '*.mdx' | wc -l | tr -d ' ')

# 2-1. 바이럴 소재(유튜브) 후보 수집 — YouTube API 키 있을 때만
if [ -n "${YOUTUBE_API_KEY:-}" ]; then
  echo "[바이럴] 유튜브 인기영상 후보 수집..."
  node scripts/fetch-viral.mjs > scripts/viral-candidates.json 2>/dev/null || echo '[]' > scripts/viral-candidates.json
else
  echo '[]' > scripts/viral-candidates.json
fi

# 3. Claude가 글 생성 (글쓰기 도구만 허용, 권한 프롬프트 없이)
echo "[Claude] 글 생성 중..."
claude -p "$(cat scripts/generate-prompt.md)" \
  --permission-mode acceptEdits \
  --allowedTools "Read Write Edit Glob Grep Bash" \
  2>&1 | tail -20

# 4. 생성 결과 확인
AFTER=$(find posts -name '*.mdx' | wc -l | tr -d ' ')
NEW=$((AFTER - BEFORE))
echo "[결과] 새 글 ${NEW}개 생성 (이전 ${BEFORE} → 현재 ${AFTER})"

if [ "$NEW" -le 0 ]; then
  echo "새 글이 없어 종료합니다."
  exit 0
fi

# 5. (제휴 링크) 쿠팡 다이나믹 배너는 사이트 컴포넌트에 상시 노출되므로
#    글마다 링크를 삽입할 필요가 없다. inject-affiliate는 더 이상 호출하지 않음.

# 6. Pexels 이미지 삽입 (키 있을 때만)
if [ -n "${PEXELS_API_KEY:-}" ]; then
  echo "[이미지] Pexels 이미지 삽입..."
  node scripts/inject-images.mjs || echo "이미지 삽입 경고 (계속)"
fi

# 7. 커밋 & 푸시
echo "[git] 커밋 & 푸시..."
git add posts/
git commit -m "auto: $(date '+%Y-%m-%d %H:%M') 새 글 ${NEW}개 자동 발행" --quiet
git push --quiet origin main

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 자동 발행 완료 — Vercel이 곧 배포합니다"
