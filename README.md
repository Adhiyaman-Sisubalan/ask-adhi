# ask-adhi

A terminal-style portfolio chatbot that answers questions about me — my work, projects,
and experience. Built to be memorable, technically honest, and actually useful for
anyone who lands on it.

**Live → [adhiyaman-sisubalan.com](https://adhiyaman-sisubalan.com)**

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

The bot is powered by **claude-haiku-4-5** (Anthropic) and uses two complementary
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

## Features

**Conversational UX**
Contextual follow-up chips appear after every bot response, matched to the topic just
discussed — so visitors can keep exploring without thinking about what to type next.
Initial chips are opinionated and personality-forward rather than generic topic labels.

**Boot animation**
On first load, the terminal runs a mock boot sequence — brewing fintech experience,
calibrating personality, loading singapore.config — before the chat interface appears.
Skipped on repeat visits using sessionStorage.

**Pixel art character (desktop)**
A pixel art developer figure walks along the bottom of the page, cycling through four
activity states: walking, typing at a desk (with a deployable progress bar), drinking
coffee or tea (time-aware — coffee before noon, tea after 6pm), and debugging (with a
floating >bug text that gets squished). The character's color palette matches the session
accent color. It speeds up when crossing behind the terminal and slows to normal pace on
the open margins.

**Reactive mobile character (status bar)**
On mobile, a smaller version of the character lives inside the status bar and reacts to
conversation state: idle breathing, leaning forward when the user types, sitting
cross-legged with thinking dots while the bot streams, jumping with a sparkle when a
response lands, and slumping with zzz when the message limit is reached. During idle
periods it cycles through micro-animations — leg kicks, coffee sips, and a >bug squish
— every 5-8 seconds.

**Personality and off-topic handling**
The bot handles off-topic and funny questions with dry wit — food preferences, movie
opinions, tabs vs spaces, roasts — drawn from a dedicated knowledge base section.
Opinion questions about AI and engineering get direct, sharp answers rather than
deflections.

**SEO and discoverability**
JSON-LD Person schema, auto-generated sitemap, Google Search Console verified, deployed
to Singapore region (sin1) for APAC latency.

---

## Tech stack

| Concern         | Choice                                         |
|-----------------|------------------------------------------------|
| Framework       | Next.js 15 (App Router)                        |
| Language        | TypeScript (strict)                            |
| Styling         | Tailwind CSS v4                                |
| AI model        | claude-haiku-4-5 (Anthropic)                 |
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
        └── claude-haiku-4-5 (tool-calling orchestrator)
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
git clone https://github.com/Adhiyaman-Sisubalan/ask-adhi.git
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
SUPABASE_SERVICE_ROLE_KEY=
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
│   ├── layout.tsx            # Root layout, metadata, JSON-LD, OG tags
│   ├── page.tsx              # Full-screen chat page
│   ├── globals.css           # Terminal theme, CSS vars, accent tokens,
│   │                         # pixel character keyframes
│   ├── sitemap.ts            # Auto-generated sitemap for SEO
│   ├── error.tsx             # Root error boundary
│   ├── opengraph-image.tsx   # Dynamic OG image (terminal aesthetic)
│   └── api/chat/route.ts     # POST handler — Claude + streaming + tools
├── components/
│   ├── Terminal.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   ├── ChipRow.tsx
│   ├── InputBar.tsx
│   ├── TypingIndicator.tsx
│   ├── BootAnimation.tsx
│   ├── StatusBar.tsx
│   └── PixelCharacter.tsx
├── data/
│   ├── resume.txt            # Source document for RAG (not committed)
│   └── profile.json          # Structured data for tool calls
├── lib/
│   ├── systemPrompt.ts
│   ├── tools.ts
│   ├── embeddings.ts
│   ├── vectorStore.ts
│   ├── profileData.ts
│   ├── suggestions.ts
│   ├── rateLimit.ts
│   ├── env.ts
│   ├── accent.ts
│   └── thinkingPhrases.ts
├── scripts/
│   └── ingest.ts             # Resume ingestion script
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

**Why a pixel art character?**
Most portfolio sites are static. A walking, typing, debugging character that reacts to
the conversation makes the experience memorable — and signals immediately that this is a
developer who enjoys craft. The speed-up behind the terminal is a small detail that most
visitors won't consciously notice but makes the animation feel considered rather than
bolted on.

**Why a reactive mobile character instead of a walking one?**
Horizontal traversal on a 390px screen looks cramped and jittery. A character that
reacts to conversation state — leaning forward when you type, thinking while the bot
streams, jumping when a response lands — is more connected to the experience and more
charming in a small space.

---

## Built in phases

This project was built in five agile phases, each driven by a spec prompt passed
to Claude Code:

- **Phase 1** — Terminal UI, Claude streaming, session history, rate limiting, boot animation
- **Phase 2** — Supabase pgvector RAG, Voyage AI embeddings, structured tool calling, follow-up chips
- **Phase 3** — Vercel deployment, OG image, security headers, mobile responsiveness
- **Phase 4** — Pixel art character (desktop + mobile), personality knowledge base, UX improvements
- **Phase 5** — Custom domain, SEO (sitemap, JSON-LD, Search Console), metadata

The spec-driven workflow is itself part of the story — each phase had a written
architecture spec before a line of code was written.

---

---

© Adhi. All rights reserved.
