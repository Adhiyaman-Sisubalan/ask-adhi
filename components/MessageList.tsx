'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types/chat'
import MessageBubble from './MessageBubble'
import ChipRow from './ChipRow'
import { INITIAL_CHIPS } from '@/lib/suggestions'
import { groupIntoPairs } from '@/utils/groupMessages'

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
  const pairs = groupIntoPairs(messages)

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {isEmpty ? (
        <div className="flex flex-col h-full justify-end px-3 sm:px-6 py-4">
          <ChipRow
            chips={INITIAL_CHIPS}
            variant="initial"
            onSelect={onChipSelect}
            disabled={isStreaming}
          />
        </div>
      ) : (
        <div
          className="px-3 sm:px-6 py-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {pairs.map((pair, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <MessageBubble
                role="user"
                content={pair.user.content}
                onChipSelect={onChipSelect}
              />
              {pair.assistant && (
                <MessageBubble
                  role="assistant"
                  content={pair.assistant.content}
                  chips={pair.assistant.chips}
                  globalStreaming={isStreaming}
                  onChipSelect={onChipSelect}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
