'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface InputBarProps {
  onSubmit: (value: string) => void
  disabled: boolean
}

export default function InputBar({ onSubmit, disabled }: InputBarProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isTyping = value.length > 0

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
      style={{ borderTop: '0.5px solid #1c1c1a', background: '#111110' }}
    >
      <span className="font-mono text-[13px] shrink-0" style={{ color: 'var(--accent)' }}>
        ❯
      </span>
      <input
        ref={inputRef}
        type="text"
        className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] min-h-[44px]"
        style={{ color: '#d4d0c8' }}
        placeholder="type your question..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        autoFocus
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
      <span className="hidden sm:inline font-mono text-[11px] shrink-0" style={{ color: '#252523' }}>
        [enter ↵]
      </span>
      <button
        className="flex sm:hidden items-center justify-center w-8 h-8 rounded-full shrink-0 transition-opacity"
        style={{
          background: disabled || !value.trim() ? '#252523' : 'var(--accent)',
          opacity: disabled ? 0.4 : 1,
        }}
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <span style={{ color: '#111110', fontSize: 14 }}>↑</span>
      </button>
    </div>
  )
}
