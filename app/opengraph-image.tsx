import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ask-adhi — terminal portfolio chatbot'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#111110',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 72px',
          fontFamily: 'monospace',
        }}
      >
        {/* Window chrome */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 48 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#E24B4A' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#EF9F27' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#639922' }} />
          <span style={{ color: '#3a3a38', fontSize: 14, marginLeft: 12 }}>
            adhi@portfolio — ask-adhi
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: '#1D9E75', fontSize: 20 }}>
            adhi@portfolio ~ % ./ask-adhi --interactive
          </div>
          <div style={{ color: '#9a9890', fontSize: 18, lineHeight: 1.6 }}>
            Initialising... done. Software developer based in Singapore.
          </div>
          <div style={{ color: '#333', fontSize: 16, marginTop: 8 }}>
            ──────────────────────────────────────────────────
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {["What do you build?", "What's your stack?", "Open to work?"].map((chip) => (
              <span
                key={chip}
                style={{
                  border: '1px solid #252523',
                  color: '#484846',
                  fontSize: 14,
                  padding: '4px 12px',
                  borderRadius: 4,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <span style={{ color: '#1D9E75', fontSize: 32, fontWeight: 600 }}>
            ask-adhi
          </span>
          <span style={{ color: '#333', fontSize: 14 }}>
            Powered by Claude · Built with Next.js
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
