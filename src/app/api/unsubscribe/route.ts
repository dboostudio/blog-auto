import { NextRequest } from 'next/server'
import { getSql, ensureSchema } from '@/lib/newsletter'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function page(title: string, body: string) {
  return new Response(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · 모아봄</title></head>
<body style="font-family:'Apple SD Gothic Neo',sans-serif;background:#f4f4f4;margin:0;padding:0">
<div style="max-width:480px;margin:80px auto;background:#fff;border-radius:16px;padding:40px 32px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.05)">
  <p style="font-size:24px;font-weight:800;color:#03c75a;margin:0 0 20px">🌱 모아봄</p>
  ${body}
  <p style="margin-top:28px"><a href="${SITE.url}" style="color:#03c75a;font-weight:700;text-decoration:none">모아봄으로 가기 →</a></p>
</div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!token) return page('오류', '<p style="font-size:16px;color:#182420">잘못된 접근입니다.</p>')

  try {
    await ensureSchema()
    const sql = getSql()
    await sql`update subscribers set status = 'unsubscribed' where token = ${token}`
    return page(
      '수신거부 완료',
      '<p style="font-size:18px;font-weight:700;color:#182420">수신거부가 처리되었어요.</p><p style="font-size:15px;color:#5a6b62;line-height:1.6;margin-top:8px">더 이상 이메일을 보내지 않습니다. 언제든 다시 구독하실 수 있어요.</p>'
    )
  } catch (e) {
    console.error('unsubscribe error', e)
    return page('오류', '<p style="font-size:16px;color:#182420">잠시 후 다시 시도해 주세요.</p>')
  }
}
