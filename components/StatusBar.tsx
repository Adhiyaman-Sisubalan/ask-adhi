'use client'
import { useEffect, useState } from 'react'

interface StatusBarProps {
  isThinking: boolean
  messageCount: number
  maxMessages?: number
  isLimitReached?: boolean
}

export function StatusBar({ isThinking, messageCount, maxMessages = 20, isLimitReached }: StatusBarProps) {
  const [dots, setDots] = useState(1)

  useEffect(() => {
    if (!isThinking) return
    const interval = setInterval(() => {
      setDots(d => (d % 3) + 1)
    }, 400)
    return () => clearInterval(interval)
  }, [isThinking])

  return (
    <div
      style={{
        background: 'var(--statusbar-bg)',
        borderTop: '0.5px solid var(--border)',
        padding: '5px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: isThinking ? 'var(--text-subtle)' : 'var(--text-dim)',
        }}
      >
        {isLimitReached
          ? 'session limit reached · refresh to start over'
          : isThinking
          ? `thinking${'.'.repeat(dots)}`
          : 'ready'}
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--border)' }}>
        {messageCount} / {maxMessages} messages
      </span>
    </div>
  )
}
