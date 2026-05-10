export const CHIP_POOL = [
  'What do you build?',
  "What's your tech stack?",
  'Tell me about a project',
  'How long have you been in Singapore?',
  'What is an MCP server?',
  'What does your day job look like?',
  'What AI tools do you actually use?',
  'What are you working on right now?',
  'How did you get into AI engineering?',
  'What is your fintech background?',
  'Tell me about HawkerAI',
  'What is agentic AI?',
  'Java or Python — which do you prefer?',
  'What has been your hardest project?',
  'What kind of problems do you enjoy?',
  'What would you build next?',
  'What makes your work different?',
  'Where do AI agents actually help?',
  'What should I ask you next?',
]

export function pickChips(n = 3): string[] {
  const shuffled = [...CHIP_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export const KEYWORD_CHIPS: Record<string, string[]> = {
  mcp: [
    "What's an MCP server?",
    'How does MCP work with Claude?',
    'What did your MCP servers connect to?',
    'Why does MCP matter for developers?',
    'Was MCP hard to adopt at work?',
  ],
  java: [
    'How long have you used Java?',
    'Spring Boot or Spring Framework?',
    'What Java work are you proud of?',
    'Where does Java still shine?',
    'Java or TypeScript for backend work?',
  ],
  react: [
    'Any React projects I can see?',
    'Frontend or full-stack?',
    'What was the React migration like?',
    'How do you approach UI work?',
    'What do you like about Next.js?',
  ],
  ai: [
    'What AI tools do you use?',
    'Tell me about the agentic work',
    'Where do AI agents actually help?',
    'How do you avoid AI hype?',
    'What would you automate next?',
  ],
  singapore: [
    'How long have you been in Singapore?',
    "What's the fintech scene like there?",
    'Why build for Singapore users?',
    'What local problem would you solve?',
    'How has Singapore shaped your work?',
  ],
  project: [
    'Tell me about HawkerAI',
    'What was the Tamagotchi project?',
    'Which project best represents you?',
    'What would you rebuild differently?',
    'What did ask-adhi teach you?',
  ],
  bank: [
    'What does CA-CIB do?',
    "What's your role there exactly?",
    'What does market risk involve?',
    'What systems do you support?',
    'How do you handle production work?',
  ],
  langgraph: [
    'How are you using LangGraph?',
    'LangGraph vs CrewAI?',
    'When would you choose LangGraph?',
    'What makes a good agent workflow?',
  ],
  crewai: [
    'What did you build with CrewAI?',
    'LangGraph vs CrewAI?',
    'What did the LinkedIn pipeline do?',
    'Would you use CrewAI again?',
  ],
}

const GENERAL_FOLLOW_UPS = [
  'What are you working on right now?',
  'What kind of team do you work best with?',
  'What kind of problems do you enjoy?',
  'What has changed in how you build software?',
  'What should a recruiter know first?',
  'What would you build next?',
  'What are you learning now?',
  'What makes your work different?',
]

interface ContextualChipOptions {
  answeredQuestion?: string
  seenQuestions?: Iterable<string>
  count?: number
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

export function getContextualChips(
  content: string,
  options: ContextualChipOptions = {}
): string[] {
  const lower = content.toLowerCase()
  const chips = new Set<string>()

  for (const [keyword, suggestions] of Object.entries(KEYWORD_CHIPS)) {
    if (lower.includes(keyword)) {
      shuffle(suggestions).forEach((suggestion) => chips.add(suggestion))
      if (chips.size >= 6) break
    }
  }

  shuffle([...GENERAL_FOLLOW_UPS, ...CHIP_POOL]).forEach((suggestion) => chips.add(suggestion))

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
