'use client'

import { ReactNode } from 'react'
import { useTheme } from './ThemeProvider'
import { HeaderCompanion } from './HeaderCompanion'

interface TerminalProps {
  children: ReactNode
  isThinking?: boolean
}

export default function Terminal({ children, isThinking = false }: TerminalProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      className="flex flex-col w-full sm:max-w-[860px] sm:mx-auto sm:rounded-xl overflow-hidden"
      style={{ height: '100dvh', background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--header-bg)',
          borderBottom: '1px solid var(--accent)',
          padding: '11px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 12,
        }}
      >
        {/* Left — brand */}
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>
          adhi<span style={{ color: 'var(--accent)' }}>@</span>portfolio
        </span>

        <HeaderCompanion isThinking={isThinking} />

        {/* Right — links + toggle */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
          <a
            href="https://linkedin.com/in/adhiyaman-sisubalan"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline"
            style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            linkedin ↗
          </a>
          <a
            href="https://github.com/Adhiyaman-Sisubalan"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline"
            style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            github ↗
          </a>
          <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark mode"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 14,
              fontFamily: 'monospace',
              padding: 0,
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </div>

      {/* Content area */}
      {children}
    </div>
  )
}
