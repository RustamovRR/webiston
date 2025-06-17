import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const fontData = await fetch(new URL('../../../assets/fonts/Inter_18pt-Bold.ttf', import.meta.url)).then((res) =>
      res.arrayBuffer(),
    )

    const fontDataRegular = await fetch(new URL('../../../assets/Inter_18pt-Regular.ttf', import.meta.url)).then(
      (res) => res.arrayBuffer(),
    )

    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') ?? "Veb Dasturlashga Oid Qo'llanmalar"
    const path = searchParams.get('path') ?? 'webiston.uz'

    // URL path-ni qismlarga ajratish
    const pathParts = path.replace(/^\/|\/$/g, '').split('/')

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020617', // To'q fon
            color: '#f8fafc', // Oq matn
            fontFamily: '"Inter"',
            padding: '60px',
          }}
        >
          {/* Logo va webiston.uz yozuvi */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: '60px', left: '80px' }}>
            <img
              src="https://www.webiston.uz/favicon.ico"
              width="60"
              height="60"
              alt="Webiston Logo"
              style={{ borderRadius: '50%' }}
            />
            <span style={{ marginLeft: '20px', fontSize: 36, fontWeight: 700 }}>webiston.uz</span>
          </div>

          {/* Asosiy kontent */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '90%',
            }}
          >
            <h1
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.1,
                backgroundImage: 'linear-gradient(to bottom right, #a7f3d0, #67e8f9)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: 20,
              }}
            >
              {title}
            </h1>

            {/* Path (breadcrumb) */}
            {pathParts.length > 1 && (
              <p
                style={{
                  fontSize: 28,
                  fontFamily: '"Inter Regular"',
                  color: '#94a3b8', // Kulrang
                  marginTop: 20,
                }}
              >
                {path}
              </p>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // Yuklab olingan shriftlarni qo'shish
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
          {
            name: 'Inter Regular',
            data: fontDataRegular,
            style: 'normal',
            weight: 400,
          },
        ],
      },
    )
  } catch (e: any) {
    console.error(`OG rasmini yaratishda xatolik: ${e?.message}`)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
