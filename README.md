# ask-adhi

A terminal-style portfolio chatbot that answers questions about me — my work, projects,
and experience. Built to be memorable, technically honest, and actually useful for
anyone who lands on it.

**Live → [ask-adhi.vercel.app](https://ask-adhi.vercel.app)**

---

## What it is

Most portfolio sites are static résumés with a timeline and a skills grid. This one
lets you have a conversation instead. Ask it anything — what I work on, what I've
built, whether I'm open to work — and it answers in first person, drawing from a
personal knowledge base that I control.

The terminal aesthetic is deliberate. It signals "developer" immediately, and the
randomly assigned accent color (green, amber, or blue) on each session gives it a
bit of personality without complexity.

---

## How it works

The bot is powered by **Claude claude-sonnet-4-6** (Anthropic) and uses two complementary
approaches to answer questions:

**RAG (Retrieval-Augmented Generation)**
My resume is chunked, embedded using Voyage AI (`voyage-3-lite`, 512 dimensions),
and stored in a Supabase pgvector table. When you ask an open-ended question —
*"tell me about your fintech experience"* — Claude searches this knowledge base
semantically and answers from the retrieved context.

**Structured tool calling**
Five typed tools give Claude direct access to structured data: `getProjects`,
`getSkills`, `getExperience`, `getContact`, and `getSuggestedQuestions`. When you
ask something precise — *"what's your tech stack?"* — Claude calls the appropriate
tool and returns structured facts rather than guessing from context.

Claude decides at runtime which approach to use — or whether to use both in the same
turn. That decision loop, driven by the model with `maxSteps: 5`, is what makes it
feel like a real conversation rather than a fancy FAQ.

---

## Tech stack

| Concern         | Choice                                         |
|-----------------|------------------------------------------------|
| Framework       | Next.js 15 (App Router)                        |
| Language        | TypeScript (strict)                            |
| Styling         | Tailwind CSS v4                                |
| AI model        | Claude claude-sonnet-4-6 (Anthropic)                |
| AI SDK          | Vercel AI SDK — streaming + tool calling       |
| Embeddings      | Voyage AI `voyage-3-lite` (free tier)          |
| Vector store    | Supabase pgvector                              |
| Analytics       | Vercel Analytics                               |
| Deployment      | Vercel (Singapore region — `sin1`)             |

---

## Architecture

```
Browser
  └── Next.js App Router (chat UI + API routes)
        └── Claude claude-sonnet-4-6 (tool-calling orchestrator)
              ├── searchKnowledge()   → Supabase pgvector (RAG)
              ├── getProjects()       → static JSON
              ├── getSkills()         → static JSON
              ├── getExperience()     → static JSON
              ├── getContact()        → static JSON
              └── getSuggestedQuestions() → keyword lookup
```

Session history is passed on every request — multi-turn conversation works correctly
without a database. Rate limiting (20 messages per session, 5 per minute) is handled
in-memory on the API route.

---

## Running locally

**Prerequisites:** Node.js 20+, a Supabase project, a Voyage AI API key, an Anthropic
API key.

```bash
git clone https://github.com/YOUR_USERNAME/ask-adhi.git
cd ask-adhi
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Set up the Supabase vector table by running `supabase/schema.sql` in your Supabase
SQL editor.

Create `data/resume.txt` with your resume as plain text. This file is intentionally
excluded from version control — it contains personal information and its content is
already embedded into Supabase after ingestion. See the existing file for the expected
structure (section headers in ALL CAPS, no markdown, plain prose).

Run ingestion:

```bash
npm run ingest
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Ingesting new content

Any time you update `data/resume.txt`, re-run the ingestion script. It clears the
existing embeddings and re-chunks from scratch:

```bash
npm run ingest
```

The script uses Voyage AI's free tier — ingesting a typical resume costs a negligible
number of tokens.

---

## Project structure

```
ask-adhi/
├── app/
│   ├── layout.tsx            # Root layout, metadata, OG tags, Analytics
│   ├── page.tsx              # Full-screen chat page
│   ├── globals.css           # Terminal theme, CSS vars, accent tokens
│   ├── error.tsx             # Root error boundary
│   ├── opengraph-image.tsx   # Dynamic OG image (terminal aesthetic)
│   └── api/chat/route.ts     # POST handler — Claude + streaming + tools
├── components/
│   ├── Terminal.tsx          # Window chrome (title bar, dots)
│   ├── MessageList.tsx       # Scrollable message history
│   ├── MessageBubble.tsx     # Individual message rendering
│   ├── ChipRow.tsx           # Suggested question chips
│   ├── InputBar.tsx          # Prompt input, mobile send button
│   └── TypingIndicator.tsx   # Streaming cursor animation
├── data/
│   ├── resume.txt            # Source document for RAG (not committed)
│   └── profile.json          # Structured data for tool calls
├── lib/
│   ├── systemPrompt.ts       # Claude system prompt
│   ├── tools.ts              # Vercel AI SDK tool definitions
│   ├── embeddings.ts         # Voyage AI embedding functions
│   ├── vectorStore.ts        # Supabase pgvector search
│   ├── profileData.ts        # Typed loader for profile.json
│   ├── suggestions.ts        # Initial chips + keyword chip map
│   ├── rateLimit.ts          # In-memory per-session rate limiter
│   ├── env.ts                # Startup env validation
│   └── accent.ts             # Random accent color picker
├── scripts/
│   └── ingest.ts             # One-time resume ingestion script
├── supabase/
│   └── schema.sql            # pgvector table + match_documents function
└── types/
    └── chat.ts               # Message, ChatSession types
```

---

## Design decisions worth noting

**Why RAG and structured tools together?**
They serve different query types. RAG handles fuzzy, narrative questions where the
answer lives in prose. Structured tools handle precise lookups where the answer is
a typed data structure. Using only one would mean either losing accuracy on factual
queries or losing nuance on contextual ones.

**Why the terminal aesthetic?**
It's a strong, opinionated visual statement that most portfolio sites avoid. It filters
for the right audience — people who find it charming are exactly who I want to talk to.
The random accent color (green / amber / blue) on each page load means every session
feels slightly different without any added complexity.

**Why Voyage AI for embeddings?**
Anthropic's recommended embedding partner. Free tier (200M tokens/month) is more than
enough for a personal knowledge base. `voyage-3-lite` at 512 dimensions keeps Supabase
storage minimal.

**Why Singapore region (`sin1`)?**
My primary audience is in Singapore and APAC. Keeping the function execution in-region
cuts cold-start latency noticeably on first response.

**Why in-memory rate limiting?**
For a personal portfolio with low traffic, it's sufficient. If traffic grows, the
documented upgrade path is Upstash Redis — two environment variables and a library
swap, no architecture change.

---

## Built in phases

This project was built in three agile phases, each driven by a spec prompt passed
to Claude Code:

- **Phase 1** — Terminal UI, Claude API streaming, session history, rate limiting
- **Phase 2** — Supabase pgvector RAG, Voyage AI embeddings, structured tool calling
- **Phase 3** — Vercel deployment, OG image, security headers, mobile responsiveness

The spec-driven workflow is itself part of the story — each phase had a written
architecture spec before a line of code was written.

---

---

© Adhi. All rights reserved.