-- Enable pgvector extension
create extension if not exists vector;

-- Documents table (voyage-3-lite outputs 512 dimensions)
create table if not exists documents (
  id         bigserial primary key,
  content    text        not null,
  embedding  vector(512) not null,
  metadata   jsonb       default '{}',
  created_at timestamptz default now()
);

-- IVFFlat index for cosine similarity search
create index if not exists documents_embedding_idx
  on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RLS: documents is a public knowledge base — disable RLS so the anon key
-- can read it, or alternatively add a policy: FOR SELECT USING (true).
-- The runtime uses the service role key (server-side only) so this is
-- belt-and-suspenders, but correct to document.
alter table documents disable row level security;

-- Match function used by vectorStore.ts
create or replace function match_documents(
  query_embedding vector(512),
  match_threshold float default 0.45,
  match_count     int   default 4
)
returns table (
  id         bigint,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
