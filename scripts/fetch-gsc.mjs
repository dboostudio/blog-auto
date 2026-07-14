#!/usr/bin/env node
// Google Search Console 성과 수집 → 최적화 후보 선별 → scripts/gsc-candidates.json
// 후보 기준: 최근 노출이 충분(신호 있음)하고, 쿨다운(최근 수정)에 걸리지 않은 /posts/ 글.
// 실제 "제목이 검색의도와 맞나"는 다음 단계에서 Claude가 판단한다.
// 환경변수: GSC_SA_KEY_FILE(서비스계정 JSON 경로, 기본 .gsc-sa.json), GSC_SITE(기본 sc-domain:moabom.net)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { JWT } from 'google-auth-library'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const KEY_FILE = process.env.GSC_SA_KEY_FILE || path.join(ROOT, '.gsc-sa.json')
const SITE = process.env.GSC_SITE || 'sc-domain:moabom.net'
const OUT = path.join(__dirname, 'gsc-candidates.json')
const STATE = path.join(__dirname, 'seo-state.json') // { slug: 'YYYY-MM-DD' } 마지막 최적화일

const MIN_IMPRESSIONS = 15   // 이만큼은 노출돼야 신호로 인정
const COOLDOWN_DAYS = 14     // 최근 수정한 글은 이 기간 재수정 안 함
const MAX_CANDIDATES = 3     // 한 회차 최대 후보 수(과도한 수정 방지)

if (!fs.existsSync(KEY_FILE)) {
  console.log(`[GSC] 서비스계정 키(${path.basename(KEY_FILE)}) 없음 — 수집 건너뜀`)
  fs.writeFileSync(OUT, '[]')
  process.exit(0)
}

const iso = d => d.toISOString().slice(0, 10)
const daysAgo = n => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d }
const END = iso(daysAgo(2))    // GSC 데이터 2~3일 지연
const START = iso(daysAgo(15)) // 14일 창

const creds = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'))
const client = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
})

const API = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`
async function query(body) {
  const res = await client.request({ url: API, method: 'POST', data: { startDate: START, endDate: END, ...body } })
  return res.data.rows || []
}

function slugFromUrl(u) {
  const m = u.match(/\/posts\/([^/?#]+)/)
  return m ? decodeURIComponent(m[1]) : null
}
function readState() { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')) } catch { return {} } }
function inCooldown(slug, state) {
  const d = state[slug]; if (!d) return false
  return (Date.now() - new Date(d).getTime()) < COOLDOWN_DAYS * 86400000
}

async function main() {
  const state = readState()
  const pages = await query({ dimensions: ['page'], rowLimit: 100 })

  const cands = []
  for (const row of pages.sort((a, b) => b.impressions - a.impressions)) {
    if (cands.length >= MAX_CANDIDATES) break
    const url = row.keys[0]
    const slug = slugFromUrl(url)
    if (!slug) continue
    if (row.impressions < MIN_IMPRESSIONS) continue
    if (inCooldown(slug, state)) continue
    const file = path.join(ROOT, 'posts', `${slug}.mdx`)
    if (!fs.existsSync(file)) continue // 리디렉션된 옛 슬러그 등 제외

    const { data } = matter(fs.readFileSync(file, 'utf8'))
    const qRows = await query({
      dimensions: ['query'],
      dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: url }] }],
      rowLimit: 10,
    })
    cands.push({
      slug,
      url,
      impressions: Math.round(row.impressions),
      clicks: Math.round(row.clicks),
      ctr: +(row.ctr * 100).toFixed(2),
      position: +row.position.toFixed(1),
      currentTitle: data.title || '',
      currentDescription: data.description || '',
      topQueries: qRows.map(q => ({
        query: q.keys[0], impressions: Math.round(q.impressions), clicks: Math.round(q.clicks),
      })),
    })
  }

  fs.writeFileSync(OUT, JSON.stringify(cands, null, 2))
  console.log(`[GSC] 기간 ${START}~${END} · 후보 ${cands.length}개: ${cands.map(c => c.slug).join(', ') || '없음'}`)
}

main().catch(e => { console.error('[GSC] 수집 실패:', e.message); fs.writeFileSync(OUT, '[]'); process.exit(0) })
