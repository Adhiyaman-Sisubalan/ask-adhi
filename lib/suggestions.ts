export const INITIAL_CHIPS = [
  'What do you build?',
  "What's your tech stack?",
  'Tell me about a project',
]

export const KEYWORD_CHIPS: Record<string, string[]> = {
  mcp:       ["What's an MCP server?", 'How does MCP work with Claude?'],
  java:      ['How long have you used Java?', 'Spring Boot or Spring Framework?'],
  react:     ['Any React projects I can see?', 'Frontend or full-stack?'],
  ai:        ['What AI tools do you use?', 'Tell me about the agentic work'],
  singapore: ['How long have you been in Singapore?', "What's the fintech scene like there?"],
  project:   ['Tell me about HawkerAI', 'What was the Tamagotchi project?'],
  bank:      ['What does CA-CIB do?', 'What\'s your role there exactly?'],
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
