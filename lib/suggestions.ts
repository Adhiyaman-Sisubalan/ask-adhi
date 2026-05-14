export const CHIP_POOL = [
  "I'm new here — where should I start?",
  'What can I ask you about Adhi?',
  'Give me the quick tour',
]

export function pickChips(_n = 3): string[] {
  return CHIP_POOL
}

export const KEYWORD_CHIPS: Record<string, string[]> = {
  project: [
    'What was the hardest part?',
    'Why did you build it?',
    'What would you do differently?',
  ],
  mcp: [
    'How does MCP fit into enterprise systems?',
    'What MCP servers have you built?',
    'Why MCP over REST?',
  ],
  langgraph: [
    'How does LangGraph compare to CrewAI?',
    'What did you build with it?',
    "What's the hardest part of multi-agent pipelines?",
  ],
  hawker: [
    'How does Claude Vision work here?',
    'How long did it take to build?',
    'What would you add next?',
  ],
  singapore: [
    'How long have you been in Singapore?',
    'What do you build for the local market?',
    'Favourite hawker dish?',
  ],
  java: [
    'Do you prefer Java or something else?',
    'How does Java fit with agentic AI?',
    "What's your Spring setup like?",
  ],
  kafka: [
    "What's the trickiest Kafka config you've dealt with?",
    'How do you use Kafka in your work?',
  ],
  ai: [
    "What's your take on AI in enterprise?",
    'What are you building with AI right now?',
    'What AI tools do you actually use daily?',
  ],
  career: [
    'What kind of work are you open to?',
    "What's your career philosophy?",
    'What would your ideal next project be?',
  ],
}

const GENERAL_FOLLOW_UPS = [
  'Tell me about your side projects',
  'What are you building right now?',
  'What do you think about AI in enterprise?',
]

interface ContextualChipOptions {
  answeredQuestion?: string
  seenQuestions?: Iterable<string>
  count?: number
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

export function getFollowUpChips(message: string): string[] {
  const lower = message.toLowerCase()
  for (const [keyword, chips] of Object.entries(KEYWORD_CHIPS)) {
    if (lower.includes(keyword)) return chips
  }
  return GENERAL_FOLLOW_UPS
}

export function excludeSeenChips(chips: string[], seenQuestions: Iterable<string>): string[] {
  const seen = new Set([...seenQuestions].map(normalizeQuestion))
  return chips.filter((chip) => !seen.has(normalizeQuestion(chip)))
}

export function getContextualChips(
  content: string,
  options: ContextualChipOptions = {}
): string[] {
  const chips = new Set(shuffle([...getFollowUpChips(content), ...GENERAL_FOLLOW_UPS]))

  const blocked = new Set(
    [
      options.answeredQuestion,
      ...(options.seenQuestions ?? []),
    ]
      .filter(Boolean)
      .map((question) => normalizeQuestion(question!))
  )

  return [...chips]
    .filter((chip) => !blocked.has(normalizeQuestion(chip)))
    .slice(0, options.count ?? 3)
}

function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}
