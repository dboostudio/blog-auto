/**
 * 전체 자동화 파이프라인 실행
 * 실행: node scripts/run-pipeline.mjs [뉴스수] [하우투수]
 * 예시: node scripts/run-pipeline.mjs 3 2
 */

import { execSync } from 'child_process'

const newsCount = process.argv[2] || '3'
const howtoCount = process.argv[3] || '2'

function run(cmd) {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

console.log('=== 블로그 자동화 파이프라인 시작 ===\n')

// 1. 황당뉴스 생성 (바이럴 유입용)
run(`node scripts/generate-post.mjs ${newsCount}`)

// 2. 하우투/레시피 생성 (구매 의도 높은 에버그린)
run(`node scripts/generate-howto.mjs ${howtoCount}`)

// 3. 이미지 삽입 (Pexels)
run('node scripts/inject-images.mjs')

// 4. 제휴 링크 삽입 (쿠팡)
run('node scripts/inject-affiliate.mjs')

// 5. 빌드 확인
run('npm run build')

console.log('\n=== 파이프라인 완료 ===')
console.log('배포: git add . && git commit -m "auto: new posts" && git push')
