'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Terminal from '@/components/Terminal'
import MessageList from '@/components/MessageList'
import InputBar from '@/components/InputBar'
import { BootAnimation } from '@/components/BootAnimation'
import { StatusBar } from '@/components/StatusBar'
import { Message } from '@/types/chat'
import { getContextualChips } from '@/lib/suggestions'
import { pickAccent } from '@/lib/accent'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [booted, setBooted] = useState(false)
  const [checked, setChecked] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false)

  const sessionIdRef = useRef<string>(uuidv4())

  useEffect(() => {
    const accent = pickAccent()
    document.documentElement.style.setProperty('--accent', accent.hex)
    if (sessionStorage.getItem('booted') === 'true') {
      setSkipAnimation(true)
      setBooted(true)
    }
    setChecked(true)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming || isDisabled) return
      setErrorMsg(null)

      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      }

      const assistantId = uuidv4()
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsStreaming(true)

      const history: { role: 'user' | 'assistant'; content: string }[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: content.trim() },
      ]

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            sessionId: sessionIdRef.current,
          }),
        })

        if (!res.ok) {
          const data = (await res.json()) as { error: string; message: string }
          if (res.status === 429) {
            setIsDisabled(true)
          }
          setErrorMsg(data.message ?? 'An error occurred.')
          setMessages((prev) => prev.filter((m) => m.id !== assistantId))
          setIsStreaming(false)
          return
        }

        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          )
        }

        const chips = getContextualChips(accumulated)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated, chips } : m
          )
        )
      } catch (err) {
        console.error('[page] send error:', err)
        setErrorMsg('Connection error. Please try again.')
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, isStreaming, isDisabled]
  )

  const userMessageCount = messages.filter(m => m.role === 'user').length

  if (!checked) return null

  return (
    <Terminal>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Boot lines — always mounted once checked, never removed */}
        <div style={{ flexShrink: 0, padding: '22px 24px 8px' }}>
          <BootAnimation
            onComplete={() => setBooted(true)}
            skipAnimation={skipAnimation}
          />
        </div>

        {/* Chat — fades in below boot lines, scrollable */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            opacity: booted ? 1 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: booted ? 'auto' : 'none',
          }}
        >
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            onChipSelect={sendMessage}
          />
          {errorMsg && (
            <div
              className="px-6 py-2 font-mono text-[12px] shrink-0"
              style={{ color: '#E24B4A', borderTop: '0.5px solid var(--border-subtle)' }}
            >
              {errorMsg}
            </div>
          )}
          <InputBar
            onSubmit={sendMessage}
            disabled={!booted || isDisabled || isStreaming}
            shouldFocus={booted && !isStreaming}
          />
          <StatusBar
            isThinking={isStreaming}
            messageCount={userMessageCount}
            isLimitReached={isDisabled}
          />
        </div>
      </div>
    </Terminal>
  )
}
