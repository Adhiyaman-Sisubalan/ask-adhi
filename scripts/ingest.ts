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

function chunkText(text: string): string[] {
  const sections = text.split(/\n{2,}/).filter((s) => s.trim().length > 20)
  const chunks: string[] = []

  for (const section of sections) {
    if (section.length <= CHUNK_SIZE) {
      chunks.push(section.trim())
    } else {
      let start = 0
      while (start < section.length) {
        const end = Math.min(start + CHUNK_SIZE, section.length)
        chunks.push(section.slice(start, end).trim())
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
  let inserted = 0

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
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
