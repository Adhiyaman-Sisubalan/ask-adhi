# ask-adhi

A terminal-style portfolio chatbot for Adhi, a software developer based in Singapore. It runs in the browser as a full-screen dark monospace interface, streams responses from Claude, and answers questions about Adhi's experience, projects, and skills — all from a rich system prompt (no database, no RAG in Phase 1).

## Tech stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + custom CSS variables
- **AI SDK**: Vercel AI SDK (`ai`) for streaming
- **LLM**: Anthropic Claude (`claude-sonnet-4-6`)
- **State**: React `useState` / `useReducer`

## Running locally

```bash
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture notes

Phase 1 uses a single system prompt as the sole knowledge source — no database, embeddings, or tool calls. The API route at `app/api/chat/route.ts` streams responses from Claude using the Vercel AI SDK. Rate limiting is in-memory (resets on server restart). Accent color (green / amber / blue) is randomly assigned per page load via a CSS custom property on `<html>`.

## Phase roadmap

| Phase | Scope |
|-------|-------|
| **Phase 1** (this) | System-prompt chatbot, streaming, multi-turn history, rate limiting, terminal UI |
| **Phase 2** | Supabase pgvector RAG, structured Claude tool calls, richer knowledge retrieval |
| **Phase 3** | Vercel deployment, analytics, persistent sessions |
