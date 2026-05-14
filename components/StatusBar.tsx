'use client'
import { useEffect, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type CharState = 'idle' | 'typing' | 'thinking' | 'landed' | 'limit'

interface StatusBarProps {
  isThinking: boolean
  messageCount: number
  maxMessages?: number
  isLimitReached?: boolean
  isTyping?: boolean
}

// ─── Mini Pixel Character — mobile status bar only ────────────────────────────
// 24×28 SVG, same colour palette as PixelCharacter.tsx

interface MiniCharProps {
  state: CharState
  accent: string
}

function MiniPixelCharacter({ state, accent }: MiniCharProps) {
  const HAIR = '#2d1b0e'
  const SKIN = '#c68642'
  const PANT = '#2a2a3a'
  const SHOE = '#111111'

  // Thinking dots (1 → 2 → 3 cycling at 500 ms)
  const [dots, setDots] = useState(1)
  useEffect(() => {
    if (state !== 'thinking') { setDots(1); return }
    const iv = setInterval(() => setDots(d => (d % 3) + 1), 500)
    return () => clearInterval(iv)
  }, [state])

  // Sparkle appears on 'landed', fades out after 500 ms
  const [showSparkle, setShowSparkle] = useState(false)
  useEffect(() => {
    if (state !== 'landed') { setShowSparkle(false); return }
    setShowSparkle(true)
    const t = setTimeout(() => setShowSparkle(false), 500)
    return () => clearTimeout(t)
  }, [state])

  // Per-state pose offsets
  const bodyDX = state === 'typing' ? 1 : 0          // lean forward
  const bodyDY = state === 'limit'  ? 2 : 0          // slump down
  const headDY = state === 'limit'  ? 1 : 0          // head droop
  const eyeH   = state === 'limit'  ? 1              // tired: half-closed
               : state === 'typing' ? 3              // attentive: wider
               : 2                                   // normal
  const eyeDY  = state === 'typing' ? -1 : 0         // eyes slightly raised

  // CSS animation class on the SVG element
  const svgClass = state === 'idle'   ? 'mini-char-breathe'
                 : state === 'landed' ? 'mini-char-jump'
                 : undefined

  return (
    // Container is 32px wide to give breathing room for the dots overlay
    <div style={{ position: 'relative', width: 32, height: 28, flexShrink: 0 }}>

      {/* Thinking dots — rendered to the right of the character */}
      {state === 'thinking' && (
        <span
          aria-hidden="true"
          style={{
            position:    'absolute',
            left:        26,
            top:         '50%',
            transform:   'translateY(-50%)',
            fontFamily:  'monospace',
            fontSize:    9,
            color:       accent,
            whiteSpace:  'nowrap',
            letterSpacing: 1,
          }}
        >
          {'.'.repeat(dots)}
        </span>
      )}

      {/* Sparkle cross — appears above the head on response-landed */}
      {showSparkle && (
        <svg
          aria-hidden="true"
          width="8" height="8"
          viewBox="0 0 8 8"
          style={{
            position:  'absolute',
            top:       -6,
            left:      8,
            animation: 'mini-sparkle-fade 0.5s ease-out forwards',
          }}
        >
          <rect x="3" y="0" width="2" height="8" fill={accent} />
          <rect x="0" y="3" width="8" height="2" fill={accent} />
        </svg>
      )}

      {/* ZZZ — fades in/out on limit state via CSS animation */}
      {state === 'limit' && (
        <span
          aria-hidden="true"
          className="mini-zzz"
          style={{
            position:   'absolute',
            top:        -8,
            right:      -4,
            fontFamily: 'monospace',
            fontSize:   8,
            color:      'var(--text-dim)',
            whiteSpace: 'nowrap',
          }}
        >
          zzz
        </span>
      )}

      {/* ── Character SVG ── */}
      <svg
        aria-hidden="true"
        width="24"
        height="28"
        viewBox="0 0 24 28"
        className={svgClass}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      >
        {/* Hair */}
        <rect x={6  + bodyDX} y={0 + headDY}          width="12" height="3"  fill={HAIR} />
        {/* Head / face */}
        <rect x={4  + bodyDX} y={3 + headDY}          width="16" height="9"  fill={SKIN} />
        {/* Left eye */}
        <rect x={7  + bodyDX} y={7 + headDY + eyeDY}  width="3"  height={eyeH} fill={HAIR} />
        {/* Right eye — one eyebrow offset for thinking state */}
        <rect
          x={14 + bodyDX}
          y={state === 'thinking' ? 6 + headDY + eyeDY : 7 + headDY + eyeDY}
          width="3"
          height={eyeH}
          fill={HAIR}
        />
        {/* Hand on chin (thinking pose) */}
        {state === 'thinking' && (
          <rect x={7} y={11} width="7" height="2" fill={SKIN} />
        )}
        {/* Body / shirt */}
        <rect x={4  + bodyDX} y={12 + bodyDY} width="16" height="7"  fill={accent} />
        {/* Left arm */}
        <rect x={1  + bodyDX} y={12 + bodyDY} width="3"  height="5"  fill={accent} />
        <rect x={1  + bodyDX} y={15 + bodyDY} width="3"  height="3"  fill={SKIN}   />
        {/* Right arm */}
        <rect x={20 + bodyDX} y={12 + bodyDY} width="3"  height="5"  fill={accent} />
        <rect x={20 + bodyDX} y={15 + bodyDY} width="3"  height="3"  fill={SKIN}   />

        {/* Legs — standing (all states except thinking) */}
        {state !== 'thinking' && (
          <>
            <rect x={6  + bodyDX} y={19 + bodyDY} width="5" height="5" fill={PANT} />
            <rect x={5  + bodyDX} y={23 + bodyDY} width="7" height="3" fill={SHOE} />
            <rect x={13 + bodyDX} y={19 + bodyDY} width="5" height="5" fill={PANT} />
            <rect x={12 + bodyDX} y={23 + bodyDY} width="7" height="3" fill={SHOE} />
          </>
        )}

        {/* Legs — cross-legged (thinking) */}
        {state === 'thinking' && (
          <>
            <rect x={3}  y={19} width="18" height="4" fill={PANT} />
            <rect x={2}  y={19} width="5"  height="4" fill={SHOE} />
            <rect x={17} y={19} width="5"  height="4" fill={SHOE} />
          </>
        )}
      </svg>
    </div>
  )
}

// ─── StatusBar ────────────────────────────────────────────────────────────────

export function StatusBar({
  isThinking,
  messageCount,
  maxMessages = 20,
  isLimitReached,
  isTyping = false,
}: StatusBarProps) {

  // Desktop animated dots (unchanged behaviour)
  const [dots, setDots] = useState(1)
  useEffect(() => {
    if (!isThinking) return
    const iv = setInterval(() => setDots(d => (d % 3) + 1), 400)
    return () => clearInterval(iv)
  }, [isThinking])

  // Accent colour — read from CSS custom property at runtime (SSR-safe)
  const [accent, setAccent] = useState('#1D9E75')
  useEffect(() => {
    const col = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim()
    if (col) setAccent(col)
  }, [])

  // ── Character state machine ────────────────────────────────────────────────
  const [charState, setCharState] = useState<CharState>('idle')

  // Refs let callbacks always read current prop values without stale closures
  const prevThinkingRef  = useRef(false)
  const isLandedRef      = useRef(false)
  const landedTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef      = useRef(isTyping)
  isTypingRef.current    = isTyping          // keep in sync on every render

  useEffect(() => {
    const clearLandedTimer = () => {
      if (landedTimerRef.current) {
        clearTimeout(landedTimerRef.current)
        landedTimerRef.current = null
      }
    }

    // ── Priority 1: limit reached ──────────────────────────────────────────
    if (isLimitReached) {
      clearLandedTimer()
      isLandedRef.current = false
      setCharState('limit')
      return
    }

    // ── Priority 2: bot is thinking ───────────────────────────────────────
    if (isThinking) {
      clearLandedTimer()
      isLandedRef.current    = false
      prevThinkingRef.current = true
      setCharState('thinking')
      return
    }

    // ── Priority 3: response just landed (thinking → false, has messages) ─
    if (prevThinkingRef.current && messageCount > 0 && !isLandedRef.current) {
      prevThinkingRef.current = false
      isLandedRef.current     = true
      setCharState('landed')
      landedTimerRef.current = setTimeout(() => {
        isLandedRef.current    = false
        landedTimerRef.current = null
        // Read isTyping via ref to avoid stale closure
        setCharState(isTypingRef.current ? 'typing' : 'idle')
      }, 1500)
      return
    }

    // ── Currently holding the landed pose — don't interrupt ───────────────
    if (isLandedRef.current) return

    // ── Default: idle or typing ────────────────────────────────────────────
    prevThinkingRef.current = false
    setCharState(isTyping ? 'typing' : 'idle')
  }, [isThinking, isTyping, isLimitReached, messageCount])

  // Cleanup landed timer on unmount
  useEffect(() => () => {
    if (landedTimerRef.current) clearTimeout(landedTimerRef.current)
  }, [])

  // ── Derived display text ─────────────────────────────────────────────────
  const statusText = isLimitReached
    ? "that's all folks"
    : isThinking
    ? `thinking${'.'.repeat(dots)}`
    : 'ready'

  const statusColor = isThinking ? 'var(--text-subtle)' : 'var(--text-dim)'

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background:      'var(--statusbar-bg)',
        borderTop:       '0.5px solid var(--border)',
        padding:         '5px 20px',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        flexShrink:      0,
      }}
    >
      {/* ── Left group ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>

        {/* Mobile-only pixel character — hidden on sm+ via Tailwind */}
        <div className="sm:hidden" style={{ flexShrink: 0 }}>
          <MiniPixelCharacter state={charState} accent={accent} />
        </div>

        {/* Status text — identical content on all viewports */}
        <span
          style={{
            fontFamily: 'monospace',
            fontSize:   11,
            color:      statusColor,
          }}
        >
          {statusText}
        </span>
      </div>

      {/* ── Right: message counter ──────────────────────────────────────── */}
      <span
        style={{
          fontFamily: 'monospace',
          fontSize:   11,
          color:      'var(--border)',
          flexShrink: 0,
          marginLeft: 8,
        }}
      >
        {messageCount} / {maxMessages} messages
      </span>
    </div>
  )
}
