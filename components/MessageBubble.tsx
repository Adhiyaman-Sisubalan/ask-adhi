'use client'

import { Message } from '@/types/chat'
import ChipRow from './ChipRow'
import TypingIndicator from './TypingIndicator'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  globalStreaming?: boolean
  onChipSelect: (chip: string) => void
}

function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*|\*→[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#d4d0c8', fontWeight: 500 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*→') && part.endsWith('*')) {
      return (
        <em key={i} style={{ color: 'var(--accent)', fontStyle: 'italic', display: 'block', marginTop: '0.75rem' }}>
          {part.slice(1, -1)}
        </em>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function MessageBubble({ message, isStreaming, globalStreaming, onChipSelect }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex gap-2 mb-5">
        <span className="mt-0.5 shrink-0 font-mono text-[13px]" style={{ color: 'var(--accent)' }}>
          ❯
        </span>
        <p className="font-mono text-[13px] leading-relaxed" style={{ color: '#d4d0c8' }}>
          {message.content}
        </p>
      </div>
    )
  }

  return (
    <div className="mb-5">
      <div
        className="font-mono text-[13px] leading-[1.7]"
        style={{ color: '#9a9890' }}
      >
        {renderContent(message.content)}
        {isStreaming && <TypingIndicator />}
      </div>
      {!isStreaming && message.chips && message.chips.length > 0 && (
        <ChipRow
          chips={message.chips}
          variant="contextual"
          onSelect={onChipSelect}
          disabled={globalStreaming}
        />
      )}
    </div>
  )
}
