const THINKING_PHRASES = [
  'querying memory',
  'scanning traces',
  'loading context',
  'checking signal',
  'assembling answer',
  'consulting vector store',
  'reading profile data',
  'routing tools',
  'indexing lore',
  'warming circuits',
] as const

export function pickThinkingPhrase(): string {
  return THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]
}
