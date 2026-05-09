interface SessionRecord {
  totalMessages: number
  recentTimestamps: number[]
}

const sessions = new Map<string, SessionRecord>()

const MAX_TOTAL = 20
const MAX_PER_MINUTE = 5
const WINDOW_MS = 60_000

export function checkRateLimit(sessionId: string): { allowed: boolean; reason?: string } {
  const record = sessions.get(sessionId)

  if (!record) return { allowed: true }

  if (record.totalMessages >= MAX_TOTAL) {
    return {
      allowed: false,
      reason: `Session limit reached (${MAX_TOTAL} messages). Start a new session to continue.`,
    }
  }

  const now = Date.now()
  const recent = record.recentTimestamps.filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX_PER_MINUTE) {
    return {
      allowed: false,
      reason: 'Too many messages — please wait a moment before sending another.',
    }
  }

  return { allowed: true }
}

export function recordMessage(sessionId: string): void {
  const now = Date.now()
  const record = sessions.get(sessionId)

  if (!record) {
    sessions.set(sessionId, { totalMessages: 1, recentTimestamps: [now] })
    return
  }

  const recent = record.recentTimestamps.filter((t) => now - t < WINDOW_MS)
  sessions.set(sessionId, {
    totalMessages: record.totalMessages + 1,
    recentTimestamps: [...recent, now],
  })
}
