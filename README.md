# ask-adhi

[![Live](https://img.shields.io/badge/live-adhiyaman--sisubalan.com-blue?style=flat-square)](https://adhiyaman-sisubalan.com) [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org) [![Anthropic](https://img.shields.io/badge/Claude-Haiku-CC785C?style=flat-square)](https://anthropic.com) [![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com) [![Vercel](https://img.shields.io/badge/Vercel-sin1-black?style=flat-square&logo=vercel)](https://vercel.com)

Terminal-style portfolio chatbot. Answers questions about my work,
projects, and experience — in first person, from a personal
knowledge base I control.

**Live → [adhiyaman-sisubalan.com](https://adhiyaman-sisubalan.com)**

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| AI model | claude-haiku-4-5 (Anthropic) |
| AI SDK | Vercel AI SDK — streaming + tool calling |
| Embeddings | Voyage AI `voyage-3-lite` |
| Vector store | Supabase pgvector |
| Deployment | Vercel `sin1` (Singapore) |

---

## How it works

```
Browser
  └── Next.js App Router
        └── claude-haiku-4-5
              ├── searchKnowledge()  → Supabase pgvector (RAG)
              ├── getProjects()      → profile.json
              ├── getSkills()        → profile.json
              ├── getExperience()    → profile.json
              └── getContact()       → profile.json
```

RAG handles open-ended questions. Structured tools handle
precise lookups. Claude decides at runtime which to use.

---

## Running locally

```bash
git clone https://github.com/Adhiyaman-Sisubalan/ask-adhi.git
cd ask-adhi
npm install
cp .env.local.example .env.local
```

`.env.local`:

```
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Run `supabase/schema.sql` in your Supabase SQL editor, then:

```bash
npm run ingest   # embed resume.txt into pgvector
npm run dev      # http://localhost:3000
```

Re-run `npm run ingest` any time `data/resume.txt` changes.

---

## Project structure

```
├── app/
│   ├── api/chat/route.ts       # Claude + streaming + tools
│   ├── globals.css             # Terminal theme, accent tokens
│   ├── layout.tsx              # Metadata, JSON-LD, OG
│   ├── page.tsx                # Chat page
│   └── sitemap.ts
├── components/
│   ├── BootAnimation.tsx
│   ├── ChipRow.tsx
│   ├── InputBar.tsx
│   ├── MessageBubble.tsx
│   ├── MessageList.tsx
│   ├── PixelCharacter.tsx
│   ├── StatusBar.tsx
│   ├── Terminal.tsx
│   └── TypingIndicator.tsx
├── data/
│   ├── profile.json            # Structured data for tools
│   └── resume.txt              # RAG source — not committed
├── lib/
│   ├── accent.ts
│   ├── embeddings.ts
│   ├── env.ts
│   ├── profileData.ts
│   ├── rateLimit.ts
│   ├── suggestions.ts
│   ├── systemPrompt.ts
│   ├── thinkingPhrases.ts
│   ├── tools.ts
│   └── vectorStore.ts
├── scripts/
│   └── ingest.ts
└── supabase/
    └── schema.sql
```

---

## Phases

- **Phase 1** — Terminal UI, streaming, session history,
  rate limiting, boot animation
- **Phase 2** — pgvector RAG, Voyage AI embeddings,
  tool calling, follow-up chips
- **Phase 3** — Vercel deployment, OG image,
  security headers, mobile
- **Phase 4** — Pixel art character (desktop + mobile),
  personality knowledge base, UX
- **Phase 5** — Custom domain, SEO, Search Console,
  metadata

---

© Adhi. All rights reserved.
