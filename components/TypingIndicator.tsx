'use client'

export default function TypingIndicator() {
  return (
    <span
      className="inline-block w-[7px] h-[13px] ml-0.5 align-middle"
      style={{
        background: 'var(--accent)',
        animation: 'blink 1s step-end infinite',
      }}
      aria-label="typing"
    />
  )
}
