You are helping me write a LinkedIn post about a portfolio project I just shipped.

ABOUT ME
I'm a software developer based in Singapore, working at a major French investment bank
on agentic AI engineering — MCP servers, multi-agent pipelines, LLM integrations. My
core stack is Java, Spring Boot, and React. I'm actively positioning myself at the
intersection of fintech and AI engineering.

THE PROJECT
I built "ask-adhi" — a terminal-style portfolio chatbot that answers questions about me
and my work. It's live at: [YOUR URL]

ARCHITECTURE (this is the story worth telling)
- Phase 1: Next.js + Claude API (claude-sonnet-4-6) with streaming responses. Full
  terminal aesthetic — dark background, monospace, random accent color (green/amber/blue)
  on every page load.
- Phase 2: Added RAG via Supabase pgvector with Voyage AI embeddings (512-dimensional,
  free tier). Added Claude tool calling with 5 structured tools: getProjects, getSkills,
  getExperience, getContact, getSuggestedQuestions. Claude decides at runtime which tool
  to call — or whether to call multiple. Multi-step tool use enables multi-tool turns.
- Phase 3: Deployed to Vercel Singapore region (sin1), added OG image in the terminal
  aesthetic, security headers, Vercel Analytics, production env validation.

THE INTERESTING DECISIONS
1. Terminal aesthetic is deliberate — it signals "developer" immediately and is memorable.
   Random accent color on each session gives it personality without complexity.
2. RAG + structured tools are complementary, not redundant. RAG handles fuzzy narrative
   questions ("tell me about your fintech experience"). Structured tools handle precise
   lookups ("what projects have you built?"). Claude routes between them automatically.
3. The suggested-questions feature is implemented via the system prompt + a tool, not a
   static UI component. Claude generates contextual chips, which means they evolve with
   the conversation.
4. Built in 3 agile phases — each phase had a spec prompt passed to Claude Code. The
   spec-driven workflow is itself a demonstration of how I approach AI-assisted development.

TONE
- Conversational and grounded — not hype-y or self-congratulatory
- Technical enough to be credible to engineers, accessible enough for recruiters
- First person, active voice
- Singapore/APAC audience — professional but warm

FORMAT
- LinkedIn post, ~200–250 words
- 3–5 short paragraphs, no bullet lists
- One punchy opening line that doesn't start with "I"
- End with a question that invites comments or a soft CTA to try the chatbot
- 3–5 relevant hashtags at the end on their own line

Write one version. Do not offer multiple variations.
