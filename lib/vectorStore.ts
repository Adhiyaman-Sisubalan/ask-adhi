import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { embedText } from './embeddings'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

export interface DocumentMatch {
  id: number
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export async function searchDocuments(
  query: string,
  matchThreshold = 0.70,
  matchCount = 4
): Promise<DocumentMatch[]> {
  const embedding = await embedText(query)

  const { data, error } = await getSupabase().rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) {
    console.error('[vectorStore] search error:', error)
    return []
  }

  return (data ?? []) as DocumentMatch[]
}
