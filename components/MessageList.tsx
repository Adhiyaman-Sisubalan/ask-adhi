'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types/chat'
import MessageBubble from './MessageBubble'
import ChipRow from './ChipRow'
import { INITIAL_CHIPS } from '@/lib/suggestions'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  onChipSelect: (chip: string) => void
}

export default function MessageList({ messages, isStreaming, onChipSelect }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 min-h-0">
      {isEmpty ? (
        <div className="flex flex-col items-start justify-center h-full">
          <div className="font-mono text-[13px] leading-[1.9]" style={{ color: 'var(--text-muted)' }}>
            <p>adhi@portfolio ~ % ./ask-adhi --interactive</p>
            <p>Initialising... done.</p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Software developer based in Singapore. Ask me anything.
            </p>
          </div>
          <div
            className="w-full my-4"
            style={{ borderTop: '0.5px solid var(--border)' }}
          />
          <ChipRow
            chips={INITIAL_CHIPS}
            variant="initial"
            onSelect={onChipSelect}
            disabled={isStreaming}
          />
        </div>
      ) : (
        <div>
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1
            const streaming = isLast && isStreaming && msg.role === 'assistant'
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={streaming}
                globalStreaming={isStreaming}
                onChipSelect={onChipSelect}
              />
            )
          })}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
