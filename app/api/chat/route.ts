import { anthropic } from '@ai-sdk/anthropic'
import { streamText, stepCountIs, type ModelMessage } from 'ai'
import { validateEnv } from '@/lib/env'
import { checkRateLimit, recordMessage } from '@/lib/rateLimit'
import { SYSTEM_PROMPT } from '@/lib/systemPrompt'
import { tools } from '@/lib/tools'
import { logQuestion } from '@/lib/questionLog'

interface IncomingMessage {
  role?: unknown
  content?: unknown
}

function getLatestUserQuestion(messages: unknown): string | null {
  if (!Array.isArray(messages)) return null

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i] as IncomingMessage
    if (message.role === 'user' && typeof message.content === 'string') {
      const question = message.content.trim()
      return question.length > 0 ? question : null
    }
  }

  return null
}

// Validate on cold start — fails loudly if keys are missing
try {
  validateEnv()
} catch (err) {
  console.error('[startup]', err)
}

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    validateEnv()
  } catch (err) {
    return Response.json(
      { error: 'configuration_error', message: String(err) },
      { status: 401 }
    )
  }

  let body: { messages: unknown; sessionId: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  const { messages, sessionId } = body

  if (!sessionId) {
    return Response.json({ error: 'sessionId required' }, { status: 400 })
  }

  const rateCheck = checkRateLimit(sessionId)
  if (!rateCheck.allowed) {
    return Response.json(
      { error: 'rate_limit', message: rateCheck.reason },
      { status: 429 }
    )
  }

  recordMessage(sessionId)

  try {
    const latestQuestion = getLatestUserQuestion(messages)
    if (latestQuestion) {
      await logQuestion({ sessionId, question: latestQuestion })
    }

    const result = streamText({
      model: anthropic('claude-haiku-4-5'),
      system: SYSTEM_PROMPT,
      messages: messages as ModelMessage[],
      tools,
      stopWhen: stepCountIs(5),
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('[chat/route] stream error:', err)
    return Response.json(
      { error: 'internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
