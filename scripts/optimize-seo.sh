#!/usr/bin/env bash
#
# SEO 자동 최적화 (하루 1회) — GSC 성과 → 검색의도 안 맞는 글 제목·설명 자동 수정 → 커밋·푸시
# 헤드리스 Claude 구독 인증 사용 (API 과금 없음).
#
# cron 예시 (매일 13:00 KST):
#   0 13 * * * /home/dboo/blog-auto/scripts/optimize-seo.sh >> /home/dboo/blog-auto/optimize-seo.log 2>&1

set -euo pipefail
REPO_DIR="$HOME/blog-auto"
cd "$REPO_DIR"

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if [ -f .env.local ]; then
  set -a; # shellcheck disable=SC1091
  . ./.env.local; set +a
fi

echo "=========================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] SEO 자동 최적화 시작"
echo "=========================================="

git pull --quiet origin main || echo "git pull 경고 (계속)"

# 1. GSC 성과 수집 → 후보 선별
echo "[GSC] 성과 데이터 수집..."
node scripts/fetch-gsc.mjs

N=$(node -e "try{console.log(require('./scripts/gsc-candidates.json').length)}catch(e){console.log(0)}")
if [ "$N" -le 0 ]; then
  echo "최적화 후보 없음 — 종료"
  exit 0
fi

# 2. Claude가 검색의도 보고 제목·설명 수정 (없는 사실 지어내기 금지, 로그·상태 갱신)
echo "[Claude] 후보 ${N}개 검색의도 최적화..."
claude -p "$(cat scripts/optimize-prompt.md)" \
  --permission-mode acceptEdits \
  --allowedTools "Read Write Edit Glob Grep" \
  2>&1 | tail -20

# 3. 변경 있으면 커밋·푸시 (제목/설명/로그/상태만)
echo "[git] 변경 확인..."
git add posts/ scripts/seo-state.json
[ -f docs/seo-optimize-log.md ] && git add docs/seo-optimize-log.md
if git diff --cached --quiet; then
  echo "수정된 글 없음 — 종료"
  exit 0
fi

git commit -m "seo-auto: $(date '+%Y-%m-%d') 검색의도 기반 제목·설명 최적화" --quiet
if ! git push --quiet origin main; then
  echo "push 거부 — pull --rebase 후 재시도"
  git pull --rebase --quiet origin main || true
  git push --quiet origin main || echo "push 재시도 실패 (다음 회차 동기화)"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] SEO 자동 최적화 완료 — Vercel이 곧 배포합니다"
