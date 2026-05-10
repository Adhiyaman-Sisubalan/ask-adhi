import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

interface QuestionLogInput {
  sessionId: string
  question: string
}

export async function logQuestion({ sessionId, question }: QuestionLogInput): Promise<void> {
  const trimmed = question.trim()
  if (!trimmed) return

  const { error } = await getSupabase()
    .from('question_logs')
    .insert({
      session_id: sessionId,
      question: trimmed.slice(0, 2000),
    })

  if (error) {
    console.warn('[questionLog] insert failed:', error.message)
  }
}
