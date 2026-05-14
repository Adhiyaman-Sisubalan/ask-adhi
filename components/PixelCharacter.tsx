'use client'

import { useEffect, useRef, useState } from 'react'

type Phase = 'walking' | 'typing' | 'drinking' | 'debugging'
type Dir   = 'right' | 'left'

const ACTIVITIES: Array<Exclude<Phase, 'walking'>> = ['typing', 'drinking', 'debugging']
const WALK_BEFORE  = 7000
const ACTIVITY_DUR = { typing: 5500, drinking: 3500, debugging: 4000 } as const
const SPEED_NORMAL = 80    // px/s — outside terminal
const SPEED_BOOST  = 400   // px/s — inside terminal
const FRAME_DIST   = 20    // px travelled between walk-frame switches

export default function PixelCharacter() {
  const [accent,    setAccent]    = useState('#1D9E75')
  const [dir,       setDir]       = useState<Dir>('right')
  const [phase,     setPhase]     = useState<Phase>('walking')
  const [frame,     setFrame]     = useState(0)
  const [actIdx,    setActIdx]    = useState(0)
  const [isMobile,  setIsMobile]  = useState(false)

  // Activity sub-states
  const [deployPct, setDeployPct] = useState(0)
  const [deployed,  setDeployed]  = useState(false)
  const [cupTilted, setCupTilted] = useState(false)
  const [bobUp,     setBobUp]     = useState(false)
  const [showBug,   setShowBug]   = useState(false)
  const [showDone,  setShowDone]  = useState(false)

  // ── Refs ──────────────────────────────────────────────────────────────
  /** The moving wrapper div — left is set directly, bypassing React renders */
  const wrapperRef      = useRef<HTMLDivElement>(null)
  /** Current x position in viewport px */
  const xRef            = useRef(-50)
  /** Mirrors dir state for RAF closure access */
  const dirRef          = useRef<Dir>('right')
  /** Mirrors phase state for RAF closure access */
  const phaseRef        = useRef<Phase>('walking')
  /** Mirrors actIdx state for RAF closure access */
  const actIdxRef       = useRef(0)
  /** True when an activity trigger was deferred because char was in terminal */
  const actDeferredRef  = useRef(false)
  /** {left, right} pixel bounds of the terminal element */
  const termBoundsRef   = useRef({ left: 0, right: 0 })
  /** Distance travelled since last frame switch */
  const distRef         = useRef(0)
  /** Timestamp of previous RAF call (0 = first frame) */
  const lastTimeRef     = useRef(0)
  /** Active RAF id */
  const rafRef          = useRef<number | null>(null)

  // Keep refs in sync with state (called every render)
  dirRef.current   = dir
  phaseRef.current = phase
  actIdxRef.current = actIdx

  // ── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Accent colour
    const col = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim()
    if (col) setAccent(col)

    // Terminal bounds + mobile flag
    const updateBounds = () => {
      const el = document.querySelector('[data-pixel-avoid]')
      if (el) {
        const rect = el.getBoundingClientRect()
        termBoundsRef.current = { left: rect.left, right: rect.right }
      }
      setIsMobile(window.innerWidth < 640)
    }
    updateBounds()
    window.addEventListener('resize', updateBounds)

    // Set initial DOM position (left not included in React style prop)
    if (wrapperRef.current) {
      wrapperRef.current.style.left = `${xRef.current}px`
    }

    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  // ── Walking — rAF-based ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'walking') return

    actDeferredRef.current = false   // reset any leftover deferral
    lastTimeRef.current    = 0

    const stopRAF = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimeRef.current = 0
    }

    const tick = (now: number) => {
      // Safety: bail if phase changed between RAF schedule and fire
      if (phaseRef.current !== 'walking') return

      const dt = lastTimeRef.current === 0
        ? 0
        : Math.min((now - lastTimeRef.current) / 1000, 0.05) // cap delta at 50 ms
      lastTimeRef.current = now

      const { left: tLeft, right: tRight } = termBoundsRef.current
      const prevX      = xRef.current
      const inTerminal = prevX > tLeft && prevX < tRight
      const speed      = inTerminal ? SPEED_BOOST : SPEED_NORMAL
      const delta      = speed * dt * (dirRef.current === 'right' ? 1 : -1)

      const maxX = window.innerWidth + 50
      const minX = -50
      let nextX  = prevX + delta

      // Boundary reversal
      if (nextX >= maxX) {
        nextX = maxX
        if (dirRef.current !== 'left') { dirRef.current = 'left'; setDir('left') }
      } else if (nextX <= minX) {
        nextX = minX
        if (dirRef.current !== 'right') { dirRef.current = 'right'; setDir('right') }
      }

      xRef.current = nextX

      // Update DOM directly — avoids a React re-render on every frame
      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${nextX}px`
      }

      // Walk-frame switch by distance (looks correct at both speeds)
      distRef.current += Math.abs(delta)
      if (distRef.current >= FRAME_DIST) {
        distRef.current %= FRAME_DIST
        setFrame(f => f ^ 1)
      }

      // Deferred activity: just exited terminal → trigger now
      const nowInTerminal = nextX > tLeft && nextX < tRight
      if (!nowInTerminal && actDeferredRef.current) {
        actDeferredRef.current = false
        stopRAF()
        setPhase(ACTIVITIES[actIdxRef.current % 3])
        return   // do not schedule next frame
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    // Activity scheduler
    const actTimer = setTimeout(() => {
      const { left: tLeft, right: tRight } = termBoundsRef.current
      const inTerminal = xRef.current > tLeft && xRef.current < tRight
      if (inTerminal) {
        actDeferredRef.current = true   // RAF loop will pick this up on exit
      } else {
        stopRAF()
        setPhase(ACTIVITIES[actIdxRef.current % 3])
      }
    }, WALK_BEFORE)

    return () => { stopRAF(); clearTimeout(actTimer) }
  }, [phase])

  // ── Typing ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'typing') return
    setDeployPct(0)
    setDeployed(false)

    let pct = 0
    const prog = setInterval(() => {
      pct = Math.min(pct + 4, 100)
      setDeployPct(pct)
      if (pct >= 100) clearInterval(prog)
    }, 80)

    const t1 = setTimeout(() => setDeployed(true), 2300)
    const t2 = setTimeout(() => { setActIdx(i => i + 1); setPhase('walking') }, ACTIVITY_DUR.typing)

    return () => { clearInterval(prog); clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  // ── Drinking ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'drinking') return
    setCupTilted(false)
    const t1 = setTimeout(() => setCupTilted(true), 700)
    const t2 = setTimeout(() => { setActIdx(i => i + 1); setPhase('walking') }, ACTIVITY_DUR.drinking)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  // ── Debugging ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'debugging') return
    setShowBug(true)
    setShowDone(false)
    setBobUp(false)

    const bobInterval = setInterval(() => setBobUp(b => !b), 380)
    const t1 = setTimeout(() => { setShowBug(false); setShowDone(true) }, 3000)
    const t2 = setTimeout(() => { setActIdx(i => i + 1); setPhase('walking') }, ACTIVITY_DUR.debugging)

    return () => { clearInterval(bobInterval); clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  // ── Derived ───────────────────────────────────────────────────────────
  const hour  = new Date().getHours()
  const isTea = hour >= 18 || (hour >= 12 && hour % 2 === 1)

  const HAIR = '#2d1b0e'
  const SKIN = '#c68642'
  const PANT = '#2a2a3a'
  const SHOE = '#111111'

  const lLegY  = frame === 0 ? 33 : 37
  const rLegY  = frame === 0 ? 37 : 33
  const headDY = phase === 'debugging' && bobUp ? -3 : 0

  const scale = isMobile ? 0.6 : 1
  const gndH  = isMobile ? 40  : 64

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        height:        gndH,
        zIndex:        1,
        pointerEvents: 'none',
        overflow:      'visible',
      }}
    >
      {/* Ground line — full viewport width */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2, background: accent, opacity: 0.3,
      }} />

      {/*
        Moving wrapper.
        NOTE: `left` is intentionally absent from the style prop.
        It is set once in the init useEffect and then mutated directly
        by the RAF loop — keeping React renders from fighting with it.
      */}
      <div
        ref={wrapperRef}
        style={{
          position:        'absolute',
          bottom:          2,
          transform:       `scale(${scale})`,
          transformOrigin: 'bottom left',
        }}
      >

        {/* ── TYPING overlay ── */}
        {phase === 'typing' && (
          <div style={{ position: 'absolute', bottom: 0, left: 44 }}>
            <svg
              width="90" height="56" viewBox="0 0 90 56"
              style={{ imageRendering: 'pixelated', overflow: 'visible' }}
            >
              <rect x="4"  y="2"  width="82" height="4" fill="#333" rx="1" />
              <rect x="4"  y="2"  width={82 * deployPct / 100} height="4" fill={accent} rx="1" />
              <rect x="4"  y="8"  width="82" height="26" fill="#222" rx="2" />
              <rect x="7"  y="11" width="76" height="20" fill="#0a1628" rx="1" />
              <rect x="11" y="15" width="30" height="2"  fill={accent} opacity="0.7" />
              <rect x="11" y="20" width="52" height="2"  fill={accent} opacity="0.4" />
              <rect x="11" y="25" width="22" height="2"  fill={accent} opacity="0.25" />
              {deployed && (
                <text x="45" y="24" fill={accent} fontSize="9" fontFamily="monospace"
                      textAnchor="middle" fontWeight="bold">DEPLOYED ✓</text>
              )}
              <rect x="0"  y="34" width="90" height="6"  fill="#4a3728" />
              <rect x="2"  y="40" width="4"  height="16" fill="#3a2a18" />
              <rect x="84" y="40" width="4"  height="16" fill="#3a2a18" />
            </svg>
          </div>
        )}

        {/* ── DRINKING overlay ── */}
        {phase === 'drinking' && (
          <svg
            width="28" height="50" viewBox="0 0 28 50"
            style={{
              position:        'absolute',
              bottom:          0,
              right:           -30,
              imageRendering:  'pixelated',
              overflow:        'hidden',
              transform:       cupTilted ? 'rotate(-32deg)' : 'none',
              transformOrigin: '50% 100%',
              transition:      'transform 0.5s ease',
            }}
          >
            {!cupTilted && (
              <>
                <circle cx="8"  cy="12" r="2.5" fill={accent} className="pixel-steam pixel-steam-1" />
                <circle cx="14" cy="10" r="2.5" fill={accent} className="pixel-steam pixel-steam-2" />
                <circle cx="20" cy="12" r="2.5" fill={accent} className="pixel-steam pixel-steam-3" />
              </>
            )}
            <rect x="3" y="14" width="22" height="3" fill={accent} />
            <rect x="3" y="17" width="22" height="3" fill={isTea ? accent       : '#7B3F00'} />
            <rect x="4" y="20" width="20" height="3" fill={isTea ? '#2d7a4a'   : '#6B3000'} />
            <rect x="5" y="23" width="18" height="3" fill={isTea ? '#2d7a4a'   : '#6B3000'} />
            <rect x="6" y="26" width="16" height="3" fill={isTea ? '#2d7a4a'   : '#6B3000'} />
            <rect x="6" y="29" width="16" height="4" fill={isTea ? '#2d7a4a'   : '#6B3000'} />
            <rect x="5" y="33" width="18" height="3" fill={isTea ? accent       : '#7B3F00'} />
            <rect x="23" y="18" width="3" height="2"  fill="#999" />
            <rect x="25" y="18" width="2" height="10" fill="#999" />
            <rect x="23" y="26" width="3" height="2"  fill="#999" />
            <rect x="5"  y="18" width="3" height="3"  fill="white" opacity="0.45" />
            {isTea && <rect x="2" y="36" width="24" height="3" fill={accent} opacity="0.7" />}
          </svg>
        )}

        {/* ── DEBUGGING overlays ── */}
        {phase === 'debugging' && showBug && (
          <>
            <svg
              width="60" height="30" viewBox="0 0 60 30"
              style={{ position: 'absolute', bottom: 20, left: 38,
                       overflow: 'visible', imageRendering: 'pixelated' }}
            >
              <text x="4"  y="20" fill={accent} fontSize="14" fontFamily="monospace"
                    className="pixel-question pixel-question-1">?</text>
              <text x="22" y="18" fill={accent} fontSize="14" fontFamily="monospace"
                    className="pixel-question pixel-question-2">?</text>
              <text x="40" y="20" fill={accent} fontSize="14" fontFamily="monospace"
                    className="pixel-question pixel-question-3">?</text>
            </svg>
            <svg width="20" height="20" viewBox="0 0 20 20"
                 style={{ position: 'absolute', bottom: 36, left: 42, imageRendering: 'pixelated' }}>
              <circle cx="10" cy="10" r="9" fill="#E24B4A" />
              <text x="10" y="15" fill="white" fontSize="11" fontFamily="monospace"
                    textAnchor="middle" fontWeight="bold">!</text>
            </svg>
          </>
        )}
        {phase === 'debugging' && !showBug && showDone && (
          <svg width="20" height="20" viewBox="0 0 20 20"
               style={{ position: 'absolute', bottom: 36, left: 42, imageRendering: 'pixelated' }}>
            <circle cx="10" cy="10" r="9" fill={accent} />
            <text x="10" y="15" fill="white" fontSize="11" fontFamily="monospace"
                  textAnchor="middle">✓</text>
          </svg>
        )}

        {/* ── CHARACTER SVG ── */}
        <svg
          width="40" height="56" viewBox="0 0 40 56"
          style={{
            imageRendering: 'pixelated',
            display:        'block',
            transform:      dir === 'left' ? 'scaleX(-1)' : 'none',
          }}
        >
          <rect x="10" y={0  + headDY} width="20" height="8"  fill={HAIR} />
          <rect x="8"  y={8  + headDY} width="24" height="16" fill={SKIN} />
          <rect x="12" y={13 + headDY} width="4"  height="4"  fill={HAIR} />
          <rect x="24" y={13 + headDY} width="4"  height="4"  fill={HAIR} />
          <rect x="8"  y="24"          width="24" height="12" fill={accent} />
          <g className={phase === 'typing' ? 'pixel-typing-arm' : ''}>
            <rect x="2" y="24" width="8" height="10" fill={accent} />
            <rect x="2" y="32" width="8" height="4"  fill={SKIN}   />
          </g>
          <g className={phase === 'typing' ? 'pixel-typing-arm' : ''} style={{ animationDelay: '0.14s' }}>
            <rect x="30" y="24" width="8" height="10" fill={accent} />
            <rect x="30" y="32" width="8" height="4"  fill={SKIN}   />
          </g>
          <rect x="10" y={lLegY}      width="9"  height="14" fill={PANT} />
          <rect x="8"  y={lLegY + 12} width="13" height="6"  fill={SHOE} />
          <rect x="21" y={rLegY}      width="9"  height="14" fill={PANT} />
          <rect x="19" y={rLegY + 12} width="13" height="6"  fill={SHOE} />
        </svg>
      </div>
    </div>
  )
}
