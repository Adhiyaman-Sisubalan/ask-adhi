import { Message } from '@/types/chat'

export function groupIntoPairs(messages: Message[]): { user: Message; assistant?: Message }[] {
  const pairs: { user: Message; assistant?: Message }[] = []
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === 'user') {
      pairs.push({
        user: messages[i],
        assistant: messages[i + 1]?.role === 'assistant' ? messages[i + 1] : undefined,
      })
      if (messages[i + 1]?.role === 'assistant') i++
    }
  }
  return pairs
}
