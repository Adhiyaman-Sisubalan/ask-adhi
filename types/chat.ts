export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  chips?: string[]
}

export interface ChatSession {
  id: string
  messages: Message[]
  accentHex: string
  started: number
}
