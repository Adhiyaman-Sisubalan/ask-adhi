'use client'

import { useEffect, useState } from 'react'

const MOODS = [
  'caffeinated',
  'debugging',
  'shipping',
  'focused',
  'agentic',
  'curious',
  'building',
  'online',
] as const

const IDLE_FACES = ['[._.]', '[•_•]', '[-_-]', '[•‿•]'] as const
const THINKING_FACES = ['[•.•]', '[•_•]', '[•-•]', '[•.•]'] as const

interface HeaderCompanionProps {
  isThinking: boolean
}

export function HeaderCompanion({ isThinking }: HeaderCompanionProps) {
  const [mood, setMood] = useState<(typeof MOODS)[number]>('online')
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setMood(MOODS[Math.floor(Math.random() * MOODS.length)])
  }, [])

  useEffect(() => {
    const frames = isThinking ? THINKING_FACES.length : IDLE_FACES.length
    const interval = setInterval(
      () => setFrame((current) => (current + 1) % frames),
      isThinking ? 360 : 1800
    )
    return () => clearInterval(interval)
  }, [isThinking])

  const face = isThinking
    ? THINKING_FACES[frame % THINKING_FACES.length]
    : IDLE_FACES[frame % IDLE_FACES.length]

  return (
    <div
      className="header-companion"
      aria-label={`terminal companion, ${isThinking ? 'thinking' : mood}`}
    >
      <span className="hidden sm:inline" style={{ color: 'var(--text-dim)' }}>
        mode:
      </span>
      <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
        {isThinking ? 'thinking' : mood}
      </span>
      <span
        className={isThinking ? 'companion-face thinking' : 'companion-face'}
        style={{ color: 'var(--text-secondary)' }}
      >
        {face}
      </span>
      <span
        className={isThinking ? 'companion-cursor thinking' : 'companion-cursor'}
        aria-hidden="true"
      >
        ▋
      </span>
    </div>
  )
}
