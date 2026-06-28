# 콘텐츠 품질 개선 루프

자동 생성 블로그의 글 품질을 사람 개입으로 한 단계씩 끌어올리는 반복 프로세스.
"생성 지침(`scripts/generate-prompt.md`)"을 직접 고치는 대신, **검수작가가 실제 산출물을 읽고 지침을 진화**시킨다.

## 등장 역할 (3명)

| 역할 | 위치 | 임무 |
|------|------|------|
| **작가** | 서버(172.30.1.3) 헤드리스 Claude | `generate-prompt.md` 지침대로 글 생성 |
| **레드팀** | 서버 헤드리스 Claude (2nd) | 발행 전 사실 검증, 허위 글 차단(`review-prompt.md`) |
| **검수작가** | 작업 세션(로컬)의 Agent | 산출물을 읽고 **품질 개선안 → 지침 변경** 제안 |

> 작가·레드팀은 자동 파이프라인(`auto-publish.sh`)에 상시 포함. **검수작가는 사람이 품질을 끌어올리고 싶을 때 수동으로 돌리는 별도 루프**다.

## 루프 절차

```
1. [검수작가] posts/ 글 전부 + generate-prompt.md 정독
              → 약점 진단 → 지침 변경안(구체 문장) 제시
2. [사람]     변경안을 generate-prompt.md에 반영 → 서버 동기화
3. [작가+레드팀] 새 지침으로 글 1개 생성 → 사실검증
4. [사람]     생성된 글을 세션으로 가져옴(ssh cat)
5. [검수작가] 그 글을 재판정
              ├ 만족  → 발행(이미지+커밋+푸시) + (선택) 미세 지침 보강
              └ 불만족 → 지침 재수정하고 2번으로 (총 2~3회 반복)
```

검수작가는 **같은 Agent 인스턴스를 SendMessage로 이어서** 사용한다(직전 지적을 기억해 "해결됐는지" 판정하게).

## 실행 방법

### 1) 검수작가 기동 (Agent 도구)
`general-purpose` 에이전트로 띄우고, 아래를 읽혀 분석시킨다:
- `posts/*.mdx` 전체
- `scripts/generate-prompt.md`

출력은 반드시 **(1)총평 (2)개선 포인트 3~5개 (3)지침 변경 구체 문장** 형식으로 받는다.
반환된 `agentId`를 보관(다음 회차 SendMessage용).

### 2) 지침 반영 + 서버 동기화
```bash
# generate-prompt.md 수정 후
git add scripts/generate-prompt.md && git commit -m "프롬프트 개선: ..." && git push
ssh 172.30.1.3 "cd ~/blog-auto && git pull --rebase -q"
```

### 3) 새 지침으로 1개 생성 + 레드팀 검수 (서버)
```bash
ssh 172.30.1.3 'cd ~/blog-auto && source ~/.nvm/nvm.sh
  set -a; . ./.env.local; set +a
  node scripts/fetch-trends.mjs > scripts/trend-candidates.json
  node scripts/fetch-viral.mjs  > scripts/viral-candidates.json
  claude -p "$(cat scripts/generate-prompt.md)\n\n## 오버라이드\n이번에는 1개만 작성하라." \
    --permission-mode acceptEdits --allowedTools "Read Write Edit Glob Grep Bash WebFetch WebSearch"
  NEW=$(git ls-files --others --exclude-standard posts/ | grep .mdx | head -1)
  claude -p "$(cat scripts/review-prompt.md)\n\n## 검수 대상\n$NEW" \
    --permission-mode acceptEdits --allowedTools "Read Edit Bash Glob Grep WebFetch WebSearch"'
```

### 4) 산출물 가져와 재판정
```bash
ssh 172.30.1.3 'cat ~/blog-auto/posts/<새파일>.mdx'   # 내용 확인
# → 검수작가에게 SendMessage(to: 저장한 agentId)로 글을 보내 "직전 지적이 해결됐는지" 판정
```

### 5) 만족 시 발행
```bash
ssh 172.30.1.3 'cd ~/blog-auto && source ~/.nvm/nvm.sh
  set -a; . ./.env.local; set +a
  node scripts/inject-images.mjs
  git add posts/ && git commit -m "auto: 검수 만족 발행" && git push'
```
불만족 시 → 검수작가가 준 새 지침으로 2번부터 다시(2~3회).

## 검수작가가 보는 기준

깊이/독창성 · 도입부 훅 · 구체성 · readability · E-E-A-T(근거·기준시점) · 행동유도 · **구조 동일성(양산 느낌)**.
"상위 1% 사람이 쓴 블로그"를 기준선으로 둔다.

## 적용 이력

- **2026-06-28 1차 루프:** 기존 9글 진단 → 5대 약점(구조 동일성, 도입부 패턴화, 출처 요약 수준, 감상형 마무리, 수익화 키워드 겉돎). `generate-prompt.md`에 다음 반영:
  - 핵심요약 박스·FAQ를 **의무 → 선택**으로, 소제목/도입부 매번 다르게
  - 모든 글에 "남들이 안 해주는 것"(자가진단 체크리스트 등) 1개 필수
  - 지원금 글 "30초 대상 자가진단", 표 한 칸 다중값 금지
  - 감상 마무리 금지 → 명령형 CTA
  - 수익화 키워드 본문 1회 자연 삽입
  - 계산 비교 시 기준값·시점 명시, 명사 종결 연속 금지
  - **결과:** GTA6 글이 첫 적용 사례로 만족 판정 → 발행
