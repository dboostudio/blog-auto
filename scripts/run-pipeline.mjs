/**
 * 전체 자동화 파이프라인 실행
 * 실행: node scripts/run-pipeline.mjs [포스트수]
 * 예시: node scripts/run-pipeline.mjs 5
 */

import { execSync } from 'child_process'

const count = process.argv[2] || '3'

function run(cmd) {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

console.log('=== 블로그 자동화 파이프라인 시작 ===\n')

// 1. 뉴스 수집 + 컨텐츠 생성
run(`node scripts/generate-post.mjs ${count}`)

// 2. 제휴 링크 삽입
run('node scripts/inject-affiliate.mjs')

// 3. 빌드 확인
run('npm run build')

console.log('\n=== 파이프라인 완료 ===')
console.log('Vercel에 배포하려면: git add . && git commit -m "auto: new posts" && git push')
