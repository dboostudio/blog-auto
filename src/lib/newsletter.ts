import 'server-only'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// 뉴스레터 서버 전용 유틸 (DB + 발신 설정). 클라이언트 번들에 포함 금지.
// neon() 은 빈/가짜 문자열에 예외를 던지므로, 빌드 타임이 아니라 요청 시 지연 초기화한다.
let _sql: NeonQueryFunction<false, false> | null = null
export function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    _sql = neon(url)
  }
  return _sql
}

export const NEWSLETTER = {
  fromName: '모아봄',
  fromEmail: process.env.NEWSLETTER_FROM || 'newsletter@moabom.net',
}

let ensured = false
// subscribers 테이블 보장 (최초 1회). status: pending | confirmed | unsubscribed
export async function ensureSchema() {
  if (ensured) return
  const sql = getSql()
  await sql`
    create table if not exists subscribers (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      status text not null default 'pending',
      token text not null,
      created_at timestamptz not null default now(),
      confirmed_at timestamptz
    )
  `
  ensured = true
}
