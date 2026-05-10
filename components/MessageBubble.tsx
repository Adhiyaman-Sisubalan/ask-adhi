'use client'

import React from 'react'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  chips?: string[]
  globalStreaming?: boolean
  onChipSelect: (chip: string) => void
}

function renderWithBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function MessageBubble({ role, content, chips, globalStreaming, onChipSelect }: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: 13, flexShrink: 0 }}>
          ❯
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7 }}>
          {content}
        </span>
      </div>
    )
  }

  // Parse follow-up line (last line starting with → or *→)
  const lines = content.split('\n')
  let followUpIndex = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('→') || trimmed.startsWith('*→')) {
      followUpIndex = i
      break
    }
  }
  const bodyLines = followUpIndex > -1 ? lines.slice(0, followUpIndex) : lines
  const followUp = followUpIndex > -1
    ? lines[followUpIndex].replace(/^\*?→\s*/, '').replace(/\*$/, '').trim()
    : null
  const bodyText = bodyLines.join('\n').trim()

  return (
    <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {bodyText && (
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {renderWithBold(bodyText)}
        </div>
      )}
      {followUp && (
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)', fontStyle: 'italic' }}>
          → {followUp}
        </div>
      )}
      {chips && chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => !globalStreaming && onChipSelect(chip)}
              disabled={globalStreaming}
              style={{
                border: '0.5px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 3,
                fontFamily: 'monospace',
                background: 'transparent',
                cursor: globalStreaming ? 'not-allowed' : 'pointer',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                opacity: globalStreaming ? 0.4 : 1,
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
