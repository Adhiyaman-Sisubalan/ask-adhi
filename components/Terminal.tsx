'use client'

import { ReactNode } from 'react'

interface TerminalProps {
  children: ReactNode
}

export default function Terminal({ children }: TerminalProps) {
  return (
    <div
      className="flex flex-col w-full max-w-[760px] mx-auto h-screen overflow-hidden"
      style={{ background: '#111110' }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-[6px] px-4 py-[10px] shrink-0"
        style={{ background: '#1c1c1a' }}
      >
        <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#E24B4A' }} />
        <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#EF9F27' }} />
        <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#639922' }} />
        <span
          className="font-mono text-[12px] ml-3"
          style={{ color: '#3a3a38' }}
        >
          adhi@portfolio — ask-adhi
        </span>
      </div>

      {/* Content area */}
      {children}
    </div>
  )
}
