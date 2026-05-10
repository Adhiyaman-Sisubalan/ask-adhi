'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Terminal from '@/components/Terminal'
import MessageList from '@/components/MessageList'
import InputBar from '@/components/InputBar'
import { BootAnimation } from '@/components/BootAnimation'
import { StatusBar } from '@/components/StatusBar'
import { Message } from '@/types/chat'
import { excludeAnsweredQuestion, getContextualChips, pickChips } from '@/lib/suggestions'
import { pickAccent } from '@/lib/accent'
import { pickThinkingPhrase } from '@/lib/thinkingPhrases'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [booted, setBooted] = useState(false)
  const [checked, setChecked] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false)
  const [initialChips] = useState<string[]>(() => pickChips(3))
  const handleBootComplete = useCallback(() => setBooted(true), [])

  const sessionIdRef = useRef<string>(uuidv4())
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const accent = pickAccent()
    document.documentElement.style.setProperty('--accent', accent.hex)
    if (sessionStorage.getItem('booted') === 'true') {
      setSkipAnimation(true)
      setBooted(true)
    }
    setChecked(true)
  }, [])

  // Scroll to bottom on new messages — not during boot animation
  useEffect(() => {
    if (!booted) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, booted])

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
        thinkingPhrase: pickThinkingPhrase(),
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

        const chips = excludeAnsweredQuestion(
          getContextualChips(accumulated),
          content.trim()
        )
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
      {/* Single unified scroll body — boot lines + chat in one continuous flow */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '22px 24px',
          gap: 4,
        }}
      >
        <BootAnimation
          onComplete={handleBootComplete}
          skipAnimation={skipAnimation}
        />
        {/* Chat fades in below boot lines — flows in the same scroll context */}
        <div
          style={{
            opacity: booted ? 1 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: booted ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 8,
          }}
        >
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            onChipSelect={sendMessage}
            initialChips={initialChips}
          />
        </div>
      </div>

      {/* Fixed bottom — outside scroll */}
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
    </Terminal>
  )
}
