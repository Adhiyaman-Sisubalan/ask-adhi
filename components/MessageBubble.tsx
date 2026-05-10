'use client'

import React from 'react'
import ChipRow from './ChipRow'
import TypingIndicator from './TypingIndicator'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  chips?: string[]
  thinkingPhrase?: string
  globalStreaming?: boolean
  onChipSelect: (chip: string) => void
}

function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--accent)', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function MessageBubble({
  role,
  content,
  chips,
  thinkingPhrase,
  globalStreaming,
  onChipSelect,
}: MessageBubbleProps) {
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
      {!bodyText && globalStreaming && (
        <TypingIndicator phrase={thinkingPhrase} />
      )}
      {bodyText && (
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {renderFormattedText(bodyText)}
        </div>
      )}
      {followUp && (
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)', fontStyle: 'italic' }}>
          → {followUp}
        </div>
      )}
      {chips && chips.length > 0 && (
        <ChipRow
          chips={chips}
          variant="contextual"
          onSelect={onChipSelect}
          disabled={globalStreaming}
        />
      )}
    </div>
  )
}
