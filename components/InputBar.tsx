'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface InputBarProps {
  onSubmit: (value: string) => void
  disabled: boolean
  shouldFocus: boolean
}

export default function InputBar({ onSubmit, disabled, shouldFocus }: InputBarProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const prevShouldFocusRef = useRef<boolean>(true)
  const isTyping = value.length > 0

  // Initial focus — desktop only (mobile keyboard pop is disruptive)
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches
    if (!isMobile) {
      inputRef.current?.focus()
    }
  }, [])

  // Re-focus when streaming completes (false → true transition), all devices
  useEffect(() => {
    if (shouldFocus && !prevShouldFocusRef.current) {
      inputRef.current?.focus()
    }
    prevShouldFocusRef.current = shouldFocus
  }, [shouldFocus])

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const msg = value.trim()
    if (!msg || disabled) return
    setValue('')
    onSubmit(msg)
  }

  return (
    <div
      className="flex items-center gap-2 px-[22px] min-h-[44px] shrink-0"
      style={{ borderTop: '0.5px solid var(--border-subtle)', background: 'var(--bg-primary)' }}
    >
      <span className="font-mono text-[13px] shrink-0" style={{ color: 'var(--accent)' }}>
        ❯
      </span>
      <input
        ref={inputRef}
        type="text"
        className="flex-1 bg-transparent border-none outline-none font-mono text-[16px] sm:text-[13px] min-h-[44px]"
        style={{ color: 'var(--text-primary)' }}
        placeholder="type your question..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        aria-label="Message input"
      />
      {!isTyping && !disabled && (
        <span
          className="font-mono hidden sm:inline"
          style={{
            color: 'var(--accent)',
            animation: 'blink 1s step-end infinite',
            fontSize: '13px',
          }}
          aria-hidden="true"
        >
          ▋
        </span>
      )}
      <span className="hidden sm:inline font-mono text-[11px] shrink-0" style={{ color: 'var(--border)' }}>
        [enter ↵]
      </span>
      <button
        className="flex sm:hidden items-center justify-center w-11 h-11 rounded-full shrink-0 transition-opacity"
        style={{
          background: disabled || !value.trim() ? 'var(--border)' : 'var(--accent)',
          opacity: disabled ? 0.4 : 1,
        }}
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <span style={{ color: 'var(--bg-primary)', fontSize: 14 }}>↑</span>
      </button>
    </div>
  )
}
