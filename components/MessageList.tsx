'use client'

import { Message } from '@/types/chat'
import MessageBubble from './MessageBubble'
import ChipRow from './ChipRow'
import { groupIntoPairs } from '@/utils/groupMessages'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  onChipSelect: (chip: string) => void
  initialChips: string[]
}

export default function MessageList({ messages, isStreaming, onChipSelect, initialChips }: MessageListProps) {
  const isEmpty = messages.length === 0
  const pairs = groupIntoPairs(messages)
  const lastPairIndex = pairs.length - 1

  if (isEmpty) {
    return (
      <ChipRow
        chips={initialChips}
        variant="initial"
        onSelect={onChipSelect}
        disabled={isStreaming}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              showChips={i === lastPairIndex && !isStreaming}
              thinkingPhrase={pair.assistant.thinkingPhrase}
              globalStreaming={isStreaming}
              onChipSelect={onChipSelect}
            />
          )}
        </div>
      ))}
    </div>
  )
}
