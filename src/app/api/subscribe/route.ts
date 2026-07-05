import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { getSql, ensureSchema, NEWSLETTER } from '@/lib/newsletter'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const honeypot = String(body.company || '') // 봇 트랩(사람에겐 안 보임)

    if (honeypot) return NextResponse.json({ ok: true }) // 봇: 조용히 무시
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ ok: false, error: '이메일 주소를 확인해 주세요.' }, { status: 400 })
    }

    await ensureSchema()
    const sql = getSql()

    const existing = await sql`select status from subscribers where email = ${email}`
    if (existing.length && existing[0].status === 'confirmed') {
      return NextResponse.json({ ok: true, already: true })
    }

    const token = randomUUID()
    await sql`
      insert into subscribers (email, status, token)
      values (${email}, 'pending', ${token})
      on conflict (email) do update set token = ${token}, status = 'pending'
    `

    const confirmUrl = `${SITE.url}/api/confirm?token=${token}`
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: `${NEWSLETTER.fromName} <${NEWSLETTER.fromEmail}>`,
      to: email,
      subject: '[모아봄] 구독 확인을 완료해 주세요',
      html: `
        <div style="font-family:'Apple SD Gothic Neo',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#182420">
          <p style="font-size:22px;font-weight:800;color:#03c75a;margin:0 0 16px">🌱 모아봄</p>
          <p style="font-size:16px;line-height:1.6">모아봄 뉴스레터 구독을 신청해 주셔서 감사합니다.<br>아래 버튼을 눌러 구독을 확인해 주세요.</p>
          <p style="margin:28px 0">
            <a href="${confirmUrl}" style="background:#03c75a;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;display:inline-block">구독 확인하기</a>
          </p>
          <p style="font-size:13px;color:#8a978f;line-height:1.6">본인이 신청하지 않았다면 이 메일을 무시하시면 됩니다. 아무 일도 일어나지 않습니다.</p>
        </div>
      `,
    })
    if (error) {
      console.error('resend error', error)
      return NextResponse.json({ ok: false, error: '메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('subscribe error', e)
    return NextResponse.json({ ok: false, error: '잠시 후 다시 시도해 주세요.' }, { status: 500 })
  }
}
