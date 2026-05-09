'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface InputBarProps {
  onSubmit: (value: string) => void
  disabled: boolean
  pendingValue?: string
}

export default function InputBar({ onSubmit, disabled, pendingValue }: InputBarProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isTyping = value.length > 0

  useEffect(() => {
    if (pendingValue !== undefined && pendingValue !== '') {
      setValue(pendingValue)
      inputRef.current?.focus()
    }
  }, [pendingValue])

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault()
      const msg = value.trim()
      setValue('')
      onSubmit(msg)
    }
  }

  return (
    <div
      className="flex items-center gap-2 px-[22px] py-[10px] shrink-0"
      style={{ borderTop: '0.5px solid #1c1c1a', background: '#111110' }}
    >
      <span className="font-mono text-[13px] shrink-0" style={{ color: 'var(--accent)' }}>
        ❯
      </span>
      <input
        ref={inputRef}
        type="text"
        className="flex-1 bg-transparent border-none outline-none font-mono text-[13px]"
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
          className="font-mono"
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
      <span className="font-mono text-[11px] shrink-0" style={{ color: '#252523' }}>
        [enter ↵]
      </span>
    </div>
  )
}
