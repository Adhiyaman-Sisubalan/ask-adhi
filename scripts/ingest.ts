import { createClient } from '@supabase/supabase-js'
import { embedBatch } from '../lib/embeddings'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CHUNK_SIZE = 400
const CHUNK_OVERLAP = 80

// ALL-CAPS lines ≤50 chars are section headers (e.g. "CERTIFICATIONS").
// We prepend the current header to each following chunk so the header word
// is searchable even though the header paragraph alone is too short to keep.
const HEADER_RE = /^[A-Z][A-Z\s/()]+$/

function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/)
  const chunks: string[] = []
  let currentHeader = ''

  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (!trimmed) continue

    if (HEADER_RE.test(trimmed) && trimmed.length <= 50) {
      currentHeader = trimmed
      continue
    }

    const content = currentHeader ? `${currentHeader}\n${trimmed}` : trimmed
    if (content.length <= CHUNK_SIZE) {
      if (content.length > 10) chunks.push(content)
    } else {
      let start = 0
      while (start < content.length) {
        const end = Math.min(start + CHUNK_SIZE, content.length)
        chunks.push(content.slice(start, end).trim())
        start += CHUNK_SIZE - CHUNK_OVERLAP
      }
    }
  }

  return chunks.filter((c) => c.length > 0)
}

async function ingest() {
  const resumePath = path.join(process.cwd(), 'data', 'resume.txt')

  if (!fs.existsSync(resumePath)) {
    console.error('data/resume.txt not found. Fill it in before running ingestion.')
    process.exit(1)
  }

  const resumeText = fs.readFileSync(resumePath, 'utf-8')
  const chunks = chunkText(resumeText)

  console.log(`Chunked resume into ${chunks.length} pieces.`)

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .neq('id', 0)

  if (deleteError) {
    console.error('Failed to clear documents table:', deleteError)
    process.exit(1)
  }

  console.log('Cleared existing documents. Embedding...')

  const BATCH_SIZE = 10
  const BATCH_DELAY_MS = 22000 // 3 RPM free-tier limit: ≥20s between requests
  let inserted = 0

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    if (i > 0) {
      process.stdout.write(`Rate-limit pause (${BATCH_DELAY_MS / 1000}s)...`)
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
      process.stdout.write(' done\n')
    }
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const embeddings = await embedBatch(batch)

    const rows = batch.map((content, j) => ({
      content,
      embedding: embeddings[j],
      metadata: { source: 'resume', chunk_index: i + j },
    }))

    const { error } = await supabase.from('documents').insert(rows)

    if (error) {
      console.error(`Failed to insert batch ${i}–${i + BATCH_SIZE}:`, error)
      process.exit(1)
    }

    inserted += batch.length
    console.log(`Inserted ${inserted}/${chunks.length} chunks...`)
  }

  console.log(`Done. ${inserted} chunks ingested into Supabase.`)
}

ingest().catch((err) => {
  console.error('Ingestion failed:', err)
  process.exit(1)
})
