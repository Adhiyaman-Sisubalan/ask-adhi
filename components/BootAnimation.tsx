'use client'
import { useEffect, useState } from 'react'

interface BootAnimationProps {
  onComplete: () => void
  skipAnimation?: boolean
}

export function BootAnimation({ onComplete, skipAnimation = false }: BootAnimationProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [bar1Width, setBar1Width] = useState(0)
  const [bar1Pct, setBar1Pct] = useState(0)
  const [bar2Width, setBar2Width] = useState(0)
  const [bar2Pct, setBar2Pct] = useState(0)

  useEffect(() => {
    if (skipAnimation) {
      setVisibleLines([0, 1, 2, 3, 4, 5, 6, 7, 8])
      setBar1Width(100)
      setBar1Pct(100)
      setBar2Width(100)
      setBar2Pct(100)
      onComplete()
      return
    }

    const sequence: Array<{ id: number | 'bar1' | 'bar2'; ms: number; dur?: number }> = [
      { id: 0,      ms: 0    },
      { id: 1,      ms: 400  },
      { id: 'bar1', ms: 700,  dur: 1800 },
      { id: 2,      ms: 2600 },
      { id: 3,      ms: 3000 },
      { id: 4,      ms: 3800 },
      { id: 5,      ms: 4200 },
      { id: 'bar2', ms: 4500, dur: 1000 },
      { id: 6,      ms: 5600 },
      { id: 7,      ms: 5900 },
      { id: 8,      ms: 6100 },
    ]

    function animateBar(
      setWidth: (v: number) => void,
      setPct: (v: number) => void,
      duration: number
    ) {
      const start = performance.now()
      function step(now: number) {
        const p = Math.min((now - start) / duration, 1)
        const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
        setWidth(eased * 100)
        setPct(Math.round(eased * 100))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    sequence.forEach(({ id, ms, dur }) => {
      const t = setTimeout(() => {
        if (id === 'bar1') animateBar(setBar1Width, setBar1Pct, dur!)
        else if (id === 'bar2') animateBar(setBar2Width, setBar2Pct, dur!)
        else setVisibleLines(prev => [...prev, id as number])
      }, ms)
      timers.push(t)
    })

    const done = setTimeout(() => {
      sessionStorage.setItem('booted', 'true')
      onComplete()
    }, 6400)
    timers.push(done)

    return () => timers.forEach(clearTimeout)
  }, [skipAnimation, onComplete])

  const lines = [
    <>
      <span style={{ color: 'var(--accent)' }}>❯</span>{' '}
      <span style={{ color: 'var(--text-primary)' }}>./ask-adhi</span>{' '}
      <span style={{ color: 'var(--text-subtle)' }}>--interactive</span>
    </>,
    <>
      <span style={{ color: 'var(--text-subtle)' }}>▸ </span>
      <span style={{ color: 'var(--accent)' }}>brewing 8 years of fintech experience...</span>
    </>,
    <>
      <span style={{ color: 'var(--accent)' }}>✔</span>{' '}
      <span style={{ color: 'var(--text-subtle)' }}>wars survived</span>{' '}
      <span style={{ color: 'var(--text-dim)' }}>production incidents, legacy codebases, 3am deployments</span>
    </>,
    <>
      <span style={{ color: 'var(--text-subtle)' }}>▸ </span>
      <span style={{ color: 'var(--accent)' }}>calibrating personality...</span>
    </>,
    <>
      <span style={{ color: 'var(--accent)' }}>✔</span>{' '}
      <span style={{ color: 'var(--text-subtle)' }}>not a resume, not a chatbot</span>{' '}
      <span style={{ color: 'var(--text-dim)' }}>— somewhere in between</span>
    </>,
    <>
      <span style={{ color: 'var(--text-subtle)' }}>▸ </span>
      <span style={{ color: 'var(--accent)' }}>loading singapore.config</span>
    </>,
    <>
      <span style={{ color: 'var(--accent)' }}>✔</span>{' '}
      <span style={{ color: 'var(--text-subtle)' }}>timezone</span>{' '}
      <span style={{ color: 'var(--text-dim)' }}>UTC+8 · hawker food preferred · kopi-o appreciated</span>
    </>,
    <span style={{ color: 'var(--text-dim)' }}>{'─'.repeat(42)}</span>,
    <>
      <span style={{ color: 'var(--accent)' }}>✔</span>{' '}
      <span style={{ color: 'var(--text-primary)' }}>ready.</span>{' '}
      <span style={{ color: 'var(--text-subtle)' }}>ask me anything.</span>
    </>,
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => (
        <div key={i}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: 1.9,
              opacity: visibleLines.includes(i) ? 1 : 0,
              transition: 'opacity 0.12s',
            }}
          >
            {line}
          </div>
          {i === 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: bar1Width > 0 ? 1 : 0,
                transition: 'opacity 0.12s',
                marginBottom: 2,
              }}
            >
              <div style={{ height: 3, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden', flex: 1, maxWidth: 200 }}>
                <div style={{ height: '100%', width: `${bar1Width}%`, background: 'var(--accent)', borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', minWidth: 34 }}>
                {bar1Pct}%
              </span>
            </div>
          )}
          {i === 5 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: bar2Width > 0 ? 1 : 0,
                transition: 'opacity 0.12s',
                marginBottom: 2,
              }}
            >
              <div style={{ height: 3, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden', flex: 1, maxWidth: 200 }}>
                <div style={{ height: '100%', width: `${bar2Width}%`, background: 'var(--accent)', borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', minWidth: 34 }}>
                {bar2Pct}%
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
