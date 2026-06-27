import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = SITE.name

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #03c75a 0%, #02a94c 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 130, marginBottom: 8 }}>🌱</div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>모아봄</div>
        <div style={{ fontSize: 38, marginTop: 16, opacity: 0.92 }}>
          꿀팁과 재미있는 이야기를 모아 봅니다
        </div>
      </div>
    ),
    size
  )
}
