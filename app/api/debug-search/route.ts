// TEMPORARY DEBUG ROUTE — DELETE BEFORE DEPLOYING
import { createClient } from '@supabase/supabase-js'
import { embedText } from '@/lib/embeddings'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') ?? 'market risk'

  // Use service role key to bypass RLS — same as vectorStore.ts
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Row count via direct table query
  const { count, error: countError } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })

  // 2. Embed the query
  let embedding: number[] | null = null
  let embedError: string | null = null
  try {
    embedding = await embedText(query)
  } catch (e) {
    embedError = String(e)
  }

  // 3. RPC call with low threshold
  let rpcResult: unknown = null
  let rpcError: unknown = null
  if (embedding) {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.30,
      match_count: 5,
    })
    rpcResult = data
    rpcError = error
  }

  return Response.json({
    query,
    tableRowCount: count,
    countError: countError ?? null,
    embedDimensions: embedding?.length ?? null,
    embedError,
    rpcError,
    rpcResultCount: Array.isArray(rpcResult) ? rpcResult.length : null,
    rpcResults: Array.isArray(rpcResult)
      ? rpcResult.map((r: { similarity: number; content: string }) => ({
          similarity: r.similarity,
          preview: r.content.slice(0, 120),
        }))
      : rpcResult,
  })
}
