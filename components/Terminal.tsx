'use client'

import { ReactNode } from 'react'
import { useTheme } from './ThemeProvider'

interface TerminalProps {
  children: ReactNode
}

export default function Terminal({ children }: TerminalProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      className="flex flex-col w-full sm:max-w-[760px] sm:mx-auto sm:rounded-xl overflow-hidden"
      style={{ height: '100dvh', background: 'var(--bg-primary)' }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-[6px] px-4 py-[10px] shrink-0"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#E24B4A' }} />
        <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#EF9F27' }} />
        <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#639922' }} />
        <span
          className="hidden sm:block font-mono text-[12px] ml-3"
          style={{ color: 'var(--text-muted)' }}
        >
          adhi@portfolio — ask-adhi
        </span>
        <button
          onClick={toggleTheme}
          aria-label="Toggle light/dark mode"
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: 14,
            padding: '0 4px',
            lineHeight: 1,
            fontFamily: 'monospace',
          }}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      {/* Content area */}
      {children}
    </div>
  )
}
