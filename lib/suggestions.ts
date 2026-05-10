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
]

export function pickChips(n = 3): string[] {
  const shuffled = [...CHIP_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export const KEYWORD_CHIPS: Record<string, string[]> = {
  mcp:       ["What's an MCP server?", 'How does MCP work with Claude?'],
  java:      ['How long have you used Java?', 'Spring Boot or Spring Framework?'],
  react:     ['Any React projects I can see?', 'Frontend or full-stack?'],
  ai:        ['What AI tools do you use?', 'Tell me about the agentic work'],
  singapore: ['How long have you been in Singapore?', "What's the fintech scene like there?"],
  project:   ['Tell me about HawkerAI', 'What was the Tamagotchi project?'],
  bank:      ['What does CA-CIB do?', "What's your role there exactly?"],
  langgraph: ['How are you using LangGraph?', 'LangGraph vs CrewAI?'],
  crewai:    ['What did you build with CrewAI?', 'LangGraph vs CrewAI?'],
}

export function getContextualChips(content: string): string[] {
  const lower = content.toLowerCase()
  const chips: string[] = []

  for (const [keyword, suggestions] of Object.entries(KEYWORD_CHIPS)) {
    if (lower.includes(keyword)) {
      chips.push(...suggestions)
      if (chips.length >= 3) break
    }
  }

  return chips.slice(0, 3)
}

function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function excludeAnsweredQuestion(chips: string[], answeredQuestion: string): string[] {
  const answered = normalizeQuestion(answeredQuestion)
  return chips.filter((chip) => normalizeQuestion(chip) !== answered)
}
