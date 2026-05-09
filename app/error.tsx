'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app/error]', error)
  }, [error])

  return (
    <div
      style={{
        background: '#111110',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <p style={{ color: '#E24B4A', fontSize: 13, margin: '0 0 8px' }}>
          ✗ something went wrong
        </p>
        <p style={{ color: '#555', fontSize: 12, margin: '0 0 24px' }}>
          {error.message ?? 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          style={{
            background: 'transparent',
            border: '0.5px solid #252523',
            color: '#484846',
            fontSize: 12,
            padding: '4px 12px',
            borderRadius: 3,
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          ↺ try again
        </button>
      </div>
    </div>
  )
}
