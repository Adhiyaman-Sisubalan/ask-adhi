'use client'

interface TypingIndicatorProps {
  phrase?: string
}

export default function TypingIndicator({ phrase = 'querying memory' }: TypingIndicatorProps) {
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 1.8,
        color: 'var(--text-secondary)',
      }}
      aria-label="assistant is thinking"
    >
      <div>
        <span style={{ color: 'var(--accent)' }}>▸</span>{' '}
        <span>thinking...</span>
      </div>
      <div style={{ paddingLeft: 14, color: 'var(--text-muted)' }}>
        <span>{phrase}</span>{' '}
        <span style={{ color: 'var(--accent)', animation: 'blink 1s step-end infinite' }}>
          ███▒▒▒
        </span>
      </div>
    </div>
  )
}
