import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { embedText } from './embeddings'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    // Service role key bypasses RLS — safe here because this module is
    // server-side only (API routes). The documents table is a public
    // knowledge base so reads are intentionally unrestricted.
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
  matchThreshold = 0.45,
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
