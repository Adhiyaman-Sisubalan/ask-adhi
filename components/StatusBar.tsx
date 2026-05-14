'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type CharState  = 'idle' | 'typing' | 'thinking' | 'landed' | 'limit'
type MicroState = 'none' | 'legkick' | 'coffee'  | 'bug'

interface StatusBarProps {
  isThinking:      boolean
  messageCount:    number
  maxMessages?:    number
  isLimitReached?: boolean
  isTyping?:       boolean
}

interface MiniCharProps {
  state:           CharState
  accent:          string
  microState:      MicroState
  onMicroComplete: () => void
}

// ─── Mini Pixel Character ─────────────────────────────────────────────────────
// 24×28 SVG — reaction states + three idle micro-animations

function MiniPixelCharacter({ state, accent, microState, onMicroComplete }: MiniCharProps) {
  const HAIR = '#2d1b0e'
  const SKIN = '#c68642'
  const PANT = '#2a2a3a'
  const SHOE = '#111111'

  // ── Reaction: thinking dots ───────────────────────────────────────────────
  const [dots, setDots] = useState(1)
  useEffect(() => {
    if (state !== 'thinking') { setDots(1); return }
    const iv = setInterval(() => setDots(d => (d % 3) + 1), 500)
    return () => clearInterval(iv)
  }, [state])

  // ── Reaction: response-landed sparkle ─────────────────────────────────────
  const [showSparkle, setShowSparkle] = useState(false)
  useEffect(() => {
    if (state !== 'landed') { setShowSparkle(false); return }
    setShowSparkle(true)
    const t = setTimeout(() => setShowSparkle(false), 500)
    return () => clearTimeout(t)
  }, [state])

  // ── Micro 1: Leg Kick ─────────────────────────────────────────────────────
  // kickFrame 0 = neutral dangle, 1 = left fwd/right back, 2 = right fwd/left back
  const [kickFrame, setKickFrame] = useState(0)
  useEffect(() => {
    if (microState !== 'legkick') { setKickFrame(0); return }
    const timers: ReturnType<typeof setTimeout>[] = []
    // 4 cycles × 2 frames × 200 ms = 1600 ms
    ;[1, 2, 1, 2, 1, 2, 1, 2].forEach((f, i) => {
      timers.push(setTimeout(() => setKickFrame(f), i * 200))
    })
    // Snap back, then signal done
    timers.push(setTimeout(() => { setKickFrame(0); onMicroComplete() }, 1700))
    return () => timers.forEach(clearTimeout)
  }, [microState, onMicroComplete])

  // ── Micro 2: Coffee Sip ───────────────────────────────────────────────────
  const [cupVisible,  setCupVisible]  = useState(false)
  const [cupTilted,   setCupTilted]   = useState(false)
  const [showSteam,   setShowSteam]   = useState(false)
  const [armExtended, setArmExtended] = useState(false)
  useEffect(() => {
    if (microState !== 'coffee') {
      setCupVisible(false); setCupTilted(false)
      setShowSteam(false);  setArmExtended(false)
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    setCupVisible(true); setArmExtended(true)
    timers.push(setTimeout(() => setShowSteam(true),               300))
    timers.push(setTimeout(() => setCupTilted(true),               600))
    timers.push(setTimeout(() => setCupTilted(false),             1200))
    timers.push(setTimeout(() => { setShowSteam(false); setArmExtended(false) }, 1500))
    timers.push(setTimeout(() => setCupVisible(false),            1800))
    timers.push(setTimeout(() => onMicroComplete(),               2000))
    return () => timers.forEach(clearTimeout)
  }, [microState, onMicroComplete])

  // ── Micro 3: Bug Squish ───────────────────────────────────────────────────
  const [bugVisible, setBugVisible] = useState(false)
  const [bugFlash,   setBugFlash]   = useState(false)
  const [armRaised,  setArmRaised]  = useState(false)
  const [showCheck,  setShowCheck]  = useState(false)
  useEffect(() => {
    if (microState !== 'bug') {
      setBugVisible(false); setBugFlash(false)
      setArmRaised(false);  setShowCheck(false)
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    setBugVisible(true)
    // 1.5 s: arm raises as bug reaches character, bug starts flashing
    timers.push(setTimeout(() => { setArmRaised(true); setBugFlash(true)    }, 1500))
    // 1.6 s: bug gone, checkmark appears
    timers.push(setTimeout(() => { setBugVisible(false); setShowCheck(true)  }, 1600))
    // 2.0 s: arm lowers, check gone
    timers.push(setTimeout(() => { setArmRaised(false); setShowCheck(false)  }, 2000))
    // 2.5 s: done
    timers.push(setTimeout(() => onMicroComplete(), 2500))
    return () => timers.forEach(clearTimeout)
  }, [microState, onMicroComplete])

  // ── Per-state pose offsets (reaction states; all zero during idle) ─────────
  const bodyDX = state === 'typing' ? 1 : 0
  const bodyDY = state === 'limit'  ? 2 : 0
  const headDY = state === 'limit'  ? 1 : 0
  const eyeH   = state === 'limit'  ? 1 : state === 'typing' ? 3 : 2
  const eyeDY  = state === 'typing' ? -1 : 0

  // ── SVG animation class ───────────────────────────────────────────────────
  // Breathing pauses while a micro is playing (character is busy)
  const svgClass =
    state === 'idle'   && microState === 'none' ? 'mini-char-breathe' :
    state === 'landed'                          ? 'mini-char-jump'    :
    undefined

  // ── Leg-kick derived ──────────────────────────────────────────────────────
  const isKicking = microState === 'legkick' && state === 'idle'
  const lDX = isKicking ? (kickFrame === 1 ?  2 : kickFrame === 2 ? -2 : 0) : 0
  const rDX = isKicking ? (kickFrame === 1 ? -2 : kickFrame === 2 ?  2 : 0) : 0
  const legY = isKicking ? 21 : 19 + bodyDY   // dangle 2 px lower during kick

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    // 32 px wide gives breathing room for thinking-dots overlay
    <div style={{ position: 'relative', width: 32, height: 28, flexShrink: 0 }}>

      {/* ── Reaction overlays ──────────────────────────────────────────── */}

      {/* Thinking dots */}
      {state === 'thinking' && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', left: 26, top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'monospace', fontSize: 9,
            color: accent, whiteSpace: 'nowrap', letterSpacing: 1,
          }}
        >
          {'.'.repeat(dots)}
        </span>
      )}

      {/* Sparkle (response landed) */}
      {showSparkle && (
        <svg
          aria-hidden="true"
          width="8" height="8" viewBox="0 0 8 8"
          style={{
            position: 'absolute', top: -6, left: 8,
            animation: 'mini-sparkle-fade 0.5s ease-out forwards',
          }}
        >
          <rect x="3" y="0" width="2" height="8" fill={accent} />
          <rect x="0" y="3" width="8" height="2" fill={accent} />
        </svg>
      )}

      {/* ZZZ (limit) */}
      {state === 'limit' && (
        <span
          aria-hidden="true"
          className="mini-zzz"
          style={{
            position: 'absolute', top: -8, right: -4,
            fontFamily: 'monospace', fontSize: 8,
            color: 'var(--text-dim)', whiteSpace: 'nowrap',
          }}
        >
          zzz
        </span>
      )}

      {/* ── Micro overlays ─────────────────────────────────────────────── */}

      {/* Bug text — crawls from right of container to left (CSS keyframe) */}
      {microState === 'bug' && bugVisible && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', left: 0, top: '50%',
            fontFamily: 'monospace', fontSize: 10,
            color: accent,
            opacity: bugFlash ? 0 : 0.7,
            animation: 'bug-crawl 4s linear forwards',
            transition: 'opacity 0.1s',
            whiteSpace: 'nowrap', pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          &gt;bug
        </span>
      )}

      {/* Checkmark (bug squished) */}
      {microState === 'bug' && showCheck && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', left: 6, top: -12,
            fontFamily: 'monospace', fontSize: 10,
            color: accent, whiteSpace: 'nowrap',
          }}
        >
          ✓
        </span>
      )}

      {/* ── Character SVG ────────────────────────────────────────────────── */}
      {/* overflow: visible lets coffee cup and extended arm render outside viewBox */}
      <svg
        aria-hidden="true"
        width="24"
        height="28"
        viewBox="0 0 24 28"
        className={svgClass}
        style={{ imageRendering: 'pixelated', display: 'block', overflow: 'visible' }}
      >
        {/* Hair */}
        <rect x={6  + bodyDX} y={headDY}                      width="12" height="3"    fill={HAIR} />
        {/* Head */}
        <rect x={4  + bodyDX} y={3  + headDY}                 width="16" height="9"    fill={SKIN} />
        {/* L-eye */}
        <rect x={7  + bodyDX} y={7  + headDY + eyeDY}         width="3"  height={eyeH} fill={HAIR} />
        {/* R-eye — 1 px higher in thinking (raised eyebrow) */}
        <rect
          x={14 + bodyDX}
          y={(state === 'thinking' ? 6 : 7) + headDY + eyeDY}
          width="3"
          height={eyeH}
          fill={HAIR}
        />
        {/* Chin hand (thinking) */}
        {state === 'thinking' && (
          <rect x={7} y={11} width="7" height="2" fill={SKIN} />
        )}

        {/* Body */}
        <rect x={4  + bodyDX} y={12 + bodyDY}                 width="16" height="7"    fill={accent} />

        {/* L arm — raises 3 px for bug squish */}
        <rect
          x={1 + bodyDX}
          y={(microState === 'bug' && armRaised ? 9 : 12) + bodyDY}
          width="3" height="5" fill={accent}
        />
        <rect
          x={1 + bodyDX}
          y={(microState === 'bug' && armRaised ? 12 : 15) + bodyDY}
          width="3" height="3" fill={SKIN}
        />

        {/* R arm */}
        <rect x={20 + bodyDX} y={12 + bodyDY}                 width="3"  height="5"    fill={accent} />
        <rect x={20 + bodyDX} y={15 + bodyDY}                 width="3"  height="3"    fill={SKIN}   />
        {/* R arm extension — bridges body to coffee cup */}
        {microState === 'coffee' && armExtended && (
          <rect x={22} y={14} width="5" height="2" fill={SKIN} />
        )}

        {/* Coffee cup — outside the 24 px viewBox, visible via overflow:visible */}
        {microState === 'coffee' && cupVisible && (
          <g
            style={{
              transform:       cupTilted ? 'rotate(-40deg)' : 'none',
              transformOrigin: '29px 21px',
              transition:      'transform 0.3s ease',
            }}
          >
            {/* Steam (reuses existing pixel-steam keyframe) */}
            {showSteam && (
              <>
                <circle cx="28" cy="11" r="1.5" fill={accent} className="pixel-steam pixel-steam-1" />
                <circle cx="31" cy="9"  r="1.5" fill={accent} className="pixel-steam pixel-steam-2" />
              </>
            )}
            {/* Accent rim (2 px) */}
            <rect x="26" y="14" width="6" height="2" fill={accent}  />
            {/* Cup body */}
            <rect x="26" y="16" width="6" height="4" fill="#6B4226" />
            {/* Narrower bottom (trapezoid feel) */}
            <rect x="27" y="20" width="4" height="2" fill="#4a2c10" />
            {/* Handle */}
            <rect x="32" y="16" width="1" height="3" fill="#6B4226" />
          </g>
        )}

        {/* Legs — standing (all non-thinking, non-kicking states) */}
        {state !== 'thinking' && !isKicking && (
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

        {/* Legs — dangling & swinging (leg kick micro) */}
        {isKicking && (
          <>
            <rect x={6  + lDX} y={legY}     width="5" height="5" fill={PANT} />
            <rect x={5  + lDX} y={legY + 4} width="6" height="2" fill={SHOE} />
            <rect x={13 + rDX} y={legY}     width="5" height="5" fill={PANT} />
            <rect x={12 + rDX} y={legY + 4} width="6" height="2" fill={SHOE} />
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

  // ── Desktop animated dots (unchanged) ─────────────────────────────────────
  const [dots, setDots] = useState(1)
  useEffect(() => {
    if (!isThinking) return
    const iv = setInterval(() => setDots(d => (d % 3) + 1), 400)
    return () => clearInterval(iv)
  }, [isThinking])

  // ── Accent colour (SSR-safe) ───────────────────────────────────────────────
  const [accent, setAccent] = useState('#1D9E75')
  useEffect(() => {
    const col = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim()
    if (col) setAccent(col)
  }, [])

  // ── Reaction state machine (unchanged) ────────────────────────────────────
  const [charState, setCharState] = useState<CharState>('idle')

  const prevThinkingRef = useRef(false)
  const isLandedRef     = useRef(false)
  const landedTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef     = useRef(isTyping)
  isTypingRef.current   = isTyping

  useEffect(() => {
    const clearLandedTimer = () => {
      if (landedTimerRef.current) {
        clearTimeout(landedTimerRef.current)
        landedTimerRef.current = null
      }
    }

    if (isLimitReached) {
      clearLandedTimer(); isLandedRef.current = false
      setCharState('limit'); return
    }
    if (isThinking) {
      clearLandedTimer(); isLandedRef.current = false
      prevThinkingRef.current = true
      setCharState('thinking'); return
    }
    if (prevThinkingRef.current && messageCount > 0 && !isLandedRef.current) {
      prevThinkingRef.current = false
      isLandedRef.current     = true
      setCharState('landed')
      landedTimerRef.current = setTimeout(() => {
        isLandedRef.current    = false
        landedTimerRef.current = null
        setCharState(isTypingRef.current ? 'typing' : 'idle')
      }, 1500)
      return
    }
    if (isLandedRef.current) return
    prevThinkingRef.current = false
    setCharState(isTyping ? 'typing' : 'idle')
  }, [isThinking, isTyping, isLimitReached, messageCount])

  // Cleanup landed timer on unmount
  useEffect(() => () => {
    if (landedTimerRef.current) clearTimeout(landedTimerRef.current)
  }, [])

  // ── Micro-animation scheduler ─────────────────────────────────────────────
  const [microState, setMicroState] = useState<MicroState>('none')

  // Kept in sync every render — safe to read inside async callbacks
  const charStateRef  = useRef<CharState>('idle')
  charStateRef.current = charState

  const lastMicroRef  = useRef<MicroState>('none')
  const microTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // scheduleNextMicro is stable — only reads refs and stable setters
  const scheduleNextMicro = useCallback(() => {
    if (microTimerRef.current) clearTimeout(microTimerRef.current)
    const delay = 5000 + Math.random() * 3000   // 5 – 8 s
    microTimerRef.current = setTimeout(() => {
      microTimerRef.current = null
      // Guard: reaction state may have changed while we were waiting
      if (charStateRef.current !== 'idle') return
      const opts: Array<Exclude<MicroState, 'none'>> = ['legkick', 'coffee', 'bug']
      const avail = opts.filter(m => m !== lastMicroRef.current)
      const next  = avail[Math.floor(Math.random() * avail.length)]
      lastMicroRef.current = next
      setMicroState(next)
    }, delay)
  }, [])  // [] intentional — stable by design; reads refs not state

  // Called by MiniPixelCharacter when a micro finishes naturally
  const handleMicroComplete = useCallback(() => {
    setMicroState('none')
    // Only reschedule if we're still idle (guard against race)
    if (charStateRef.current === 'idle') scheduleNextMicro()
  }, [scheduleNextMicro])

  // Start / cancel the micro scheduler whenever charState changes
  useEffect(() => {
    if (charState !== 'idle') {
      // Cancel the pending scheduled micro AND cancel any active micro
      if (microTimerRef.current) {
        clearTimeout(microTimerRef.current)
        microTimerRef.current = null
      }
      setMicroState('none')
      return
    }
    // Just entered idle — start the random-interval scheduler
    scheduleNextMicro()
    return () => {
      if (microTimerRef.current) {
        clearTimeout(microTimerRef.current)
        microTimerRef.current = null
      }
    }
  }, [charState, scheduleNextMicro])

  // Final cleanup on unmount
  useEffect(() => () => {
    if (microTimerRef.current) clearTimeout(microTimerRef.current)
  }, [])

  // ── Derived status text ───────────────────────────────────────────────────
  const statusText = isLimitReached
    ? "that's all folks"
    : isThinking
    ? `thinking${'.'.repeat(dots)}`
    : 'ready'

  const statusColor = isThinking ? 'var(--text-subtle)' : 'var(--text-dim)'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background:     'var(--statusbar-bg)',
        borderTop:      '0.5px solid var(--border)',
        padding:        '5px 20px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexShrink:     0,
      }}
    >
      {/* Left group — character (mobile only) + status text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>

        {/* Mobile-only pixel character — hidden on sm+ via Tailwind */}
        <div className="sm:hidden" style={{ flexShrink: 0 }}>
          <MiniPixelCharacter
            state={charState}
            accent={accent}
            microState={microState}
            onMicroComplete={handleMicroComplete}
          />
        </div>

        {/* Status text */}
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: statusColor }}>
          {statusText}
        </span>
      </div>

      {/* Right — message counter */}
      <span
        style={{
          fontFamily: 'monospace', fontSize: 11,
          color: 'var(--border)', flexShrink: 0, marginLeft: 8,
        }}
      >
        {messageCount} / {maxMessages} messages
      </span>
    </div>
  )
}
