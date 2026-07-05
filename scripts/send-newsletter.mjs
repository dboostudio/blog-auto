#!/usr/bin/env node
// 새 글을 확인된 구독자에게 이메일 발송 (Resend).
// - 최초 실행: 기존 글을 전부 'sent'로 시드만 하고 발송하지 않음(백필 스팸 방지).
// - 이후: 최근 48시간 내 발행됐고 아직 안 보낸 글만 발송. sent_posts로 중복 방지.
// 사용: node scripts/send-newsletter.mjs [slug ...]   (slug 지정 시 해당 글 강제 발송)
// 환경변수: DATABASE_URL, RESEND_API_KEY, NEWSLETTER_FROM(선택), NEXT_PUBLIC_SITE_URL(선택)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT, 'posts')
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://moabom.net'
const FROM = `모아봄 <${process.env.NEWSLETTER_FROM || 'newsletter@moabom.net'}>`
const WINDOW_MS = 48 * 60 * 60 * 1000

if (!process.env.DATABASE_URL || !process.env.RESEND_API_KEY) {
  console.log('[뉴스레터] DATABASE_URL/RESEND_API_KEY 없음 — 발송 건너뜀')
  process.exit(0)
}

const sql = neon(process.env.DATABASE_URL)
const resend = new Resend(process.env.RESEND_API_KEY)
const sleep = ms => new Promise(r => setTimeout(r, ms))

function readPosts() {
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8'))
      return {
        slug: f.replace(/\.mdx$/, ''),
        title: data.title || '',
        description: data.description || '',
        cover: data.cover_image || '',
        excerpt: makeExcerpt(content),
        when: new Date(data.published || data.date || 0).getTime(),
      }
    })
}

// 본문 MDX에서 이메일용 발췌(문단 2~3개, 인라인 마크다운 정리)
function makeExcerpt(content, maxChars = 500) {
  const blocks = content.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)
  const paras = []
  for (const b of blocks) {
    // 표·이미지·JSX·소제목·인용·리스트·박스 등은 건너뛰고 줄글 문단만
    if (/^(#|>|\||!\[|<|```|-\s|\*\s|\d+\.\s|\[\s*\])/.test(b)) continue
    if (b.includes('|') && b.includes('---')) continue
    const clean = b
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')            // 이미지
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')          // 링크 → 텍스트
      .replace(/\*\*([^*]+)\*\*/g, '$1')                // 굵게
      .replace(/[*_`]/g, '')                            // 잔여 마크다운
      .replace(/\s+/g, ' ')
      .trim()
    if (clean.length < 15) continue
    paras.push(clean)
    if (paras.join(' ').length > maxChars || paras.length >= 3) break
  }
  let text = paras.join('\n\n')
  if (text.length > maxChars) text = text.slice(0, maxChars).replace(/\s+\S*$/, '') + '…'
  return text
}

function emailHtml(post, unsubUrl) {
  const url = `${SITE}/posts/${post.slug}`
  const cover = post.cover
    ? `<a href="${url}"><img src="${post.cover}" alt="" width="560" style="width:100%;max-width:560px;height:auto;border-radius:12px;display:block;margin:0 0 24px"></a>`
    : ''
  const bodyParas = (post.excerpt || post.description || '')
    .split(/\n{2,}/)
    .map(p => `<p style="font-size:16px;line-height:1.8;color:#2a352f;margin:0 0 18px">${p}</p>`)
    .join('')
  return `
    <div style="font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#182420">
      <p style="font-size:22px;font-weight:800;color:#03c75a;margin:0 0 4px">🌱 모아봄</p>
      <p style="font-size:13px;color:#9aa79f;margin:0 0 24px">새 글이 올라왔어요</p>
      ${cover}
      <h1 style="font-size:26px;font-weight:900;line-height:1.35;margin:0 0 20px;color:#141c18;letter-spacing:-0.5px">${post.title}</h1>
      ${bodyParas}
      <p style="margin:28px 0 8px">
        <a href="${url}" style="background:#03c75a;color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:10px;display:inline-block">전문 이어 읽기 →</a>
      </p>
      <p style="font-size:13px;color:#b0bab3;margin:8px 0 0">이 메일은 요약본이에요. 표·자가진단·FAQ 등 전체 내용은 위 버튼에서 확인하세요.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px">
      <p style="font-size:12px;color:#9aa79f;line-height:1.7">
        생활·경제 꿀팁과 화제글을 모아, 모아봄 · <a href="${SITE}" style="color:#03c75a">moabom.net</a><br>
        더 이상 받지 않으려면 <a href="${unsubUrl}" style="color:#9aa79f">여기서 수신거부</a>하세요.
      </p>
    </div>`
}

async function main() {
  await sql`create table if not exists sent_posts (slug text primary key, sent_at timestamptz not null default now())`

  const sentRows = await sql`select slug from sent_posts`
  const sent = new Set(sentRows.map(r => r.slug))
  const posts = readPosts()
  const forced = process.argv.slice(2)

  // 최초 실행: 전량 시드만(발송 X)
  if (!sent.size && !forced.length) {
    for (const p of posts) await sql`insert into sent_posts (slug) values (${p.slug}) on conflict do nothing`
    console.log(`[뉴스레터] 최초 실행 — 기존 글 ${posts.length}개 시드 완료(발송 없음). 다음 새 글부터 발송됩니다.`)
    return
  }

  const now = Date.now()
  const toSend = forced.length
    ? posts.filter(p => forced.includes(p.slug))
    : posts.filter(p => !sent.has(p.slug) && now - p.when < WINDOW_MS)

  if (!toSend.length) { console.log('[뉴스레터] 보낼 새 글 없음'); return }

  const subs = await sql`select email, token from subscribers where status = 'confirmed'`
  if (!subs.length) {
    console.log('[뉴스레터] 확인된 구독자 0명 — 발송 없이 sent 처리')
    for (const p of toSend) await sql`insert into sent_posts (slug) values (${p.slug}) on conflict do nothing`
    return
  }

  for (const post of toSend) {
    let ok = 0
    for (const s of subs) {
      const unsubUrl = `${SITE}/api/unsubscribe?token=${s.token}`
      try {
        const { error } = await resend.emails.send({
          from: FROM,
          to: s.email,
          subject: `[모아봄] ${post.title}`,
          html: emailHtml(post, unsubUrl),
          headers: { 'List-Unsubscribe': `<${unsubUrl}>` },
        })
        if (error) console.error(`  ✗ ${s.email}:`, error.message || error)
        else ok++
      } catch (e) {
        console.error(`  ✗ ${s.email}:`, e.message)
      }
      await sleep(600) // Resend 무료 레이트리밋 여유
    }
    await sql`insert into sent_posts (slug) values (${post.slug}) on conflict do nothing`
    console.log(`[뉴스레터] "${post.title}" → ${ok}/${subs.length}명 발송`)
  }
}

main().catch(e => { console.error('[뉴스레터] 실패:', e.message); process.exit(1) })
