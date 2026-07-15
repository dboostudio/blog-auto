#!/usr/bin/env node
// 새 글을 스레드(Threads)에 텍스트로 자동 게시 (후킹 + 요약 + 클릭 가능한 백링크).
// - 최초 실행: 기존 글을 전부 posted로 시드만(백필 방지).
// - 이후: 최근 48시간 내 발행됐고 아직 안 올린 글만 게시. threads_posts(Neon)로 중복 방지.
// 사용: node scripts/threads-post.mjs [slug ...]  (slug 지정 시 강제 게시)
// 환경변수: THREADS_USER_ID, THREADS_TOKEN, DATABASE_URL, NEXT_PUBLIC_SITE_URL(선택)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { neon } from '@neondatabase/serverless'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT, 'posts')
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://moabom.net'
const BASE = 'https://graph.threads.net/v1.0'
const WINDOW_MS = 48 * 60 * 60 * 1000

const USER_ID = process.env.THREADS_USER_ID
const TOKEN = process.env.THREADS_TOKEN
if (!USER_ID || !TOKEN || !process.env.DATABASE_URL) {
  console.log('[스레드] THREADS_USER_ID/THREADS_TOKEN/DATABASE_URL 없음 — 게시 건너뜀')
  process.exit(0)
}
const sql = neon(process.env.DATABASE_URL)
const sleep = ms => new Promise(r => setTimeout(r, ms))

function readPosts() {
  return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx')).map(f => {
    const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8'))
    return {
      slug: f.replace(/\.mdx$/, ''),
      title: data.title || '',
      description: data.description || '',
      when: new Date(data.published || data.date || 0).getTime(),
    }
  })
}

// 스레드 본문(최대 500자). 링크는 자동으로 클릭 가능.
function buildText(p) {
  const url = `${SITE}/posts/${p.slug}`
  let desc = (p.description || '').trim()
  const head = `${p.title}\n\n`
  const tail = `\n\n👉 ${url}`
  const room = 480 - head.length - tail.length
  if (desc.length > room) desc = desc.slice(0, Math.max(0, room - 1)).replace(/\s+\S*$/, '') + '…'
  return head + desc + tail
}

async function api(pathname, params) {
  const res = await fetch(BASE + pathname, {
    method: 'POST',
    body: new URLSearchParams({ ...params, access_token: TOKEN }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${pathname} ${res.status}: ${JSON.stringify(j)}`)
  return j
}

async function postOne(p) {
  const container = await api(`/${USER_ID}/threads`, { media_type: 'TEXT', text: buildText(p) })
  await sleep(1500) // 컨테이너 처리 여유
  const pub = await api(`/${USER_ID}/threads_publish`, { creation_id: container.id })
  return pub.id
}

async function main() {
  await sql`create table if not exists threads_posts (slug text primary key, posted_at timestamptz not null default now())`
  const done = new Set((await sql`select slug from threads_posts`).map(r => r.slug))
  const posts = readPosts()
  const forced = process.argv.slice(2)

  if (!done.size && !forced.length) {
    for (const p of posts) await sql`insert into threads_posts (slug) values (${p.slug}) on conflict do nothing`
    console.log(`[스레드] 최초 실행 — 기존 글 ${posts.length}개 시드(게시 없음). 다음 새 글부터 게시.`)
    return
  }

  const now = Date.now()
  const toPost = forced.length
    ? posts.filter(p => forced.includes(p.slug))
    : posts.filter(p => !done.has(p.slug) && now - p.when < WINDOW_MS)

  if (!toPost.length) { console.log('[스레드] 게시할 새 글 없음'); return }

  for (const p of toPost) {
    try {
      const id = await postOne(p)
      await sql`insert into threads_posts (slug) values (${p.slug}) on conflict do nothing`
      console.log(`[스레드] "${p.title}" 게시 완료 (id ${id})`)
    } catch (e) {
      console.error(`[스레드] "${p.slug}" 게시 실패:`, e.message)
    }
    await sleep(2000)
  }
}

main().catch(e => { console.error('[스레드] 실패:', e.message); process.exit(1) })
