const ACCENTS = [
  { name: 'green', hex: '#1D9E75' },
  { name: 'amber', hex: '#EF9F27' },
  { name: 'blue',  hex: '#378ADD' },
] as const

export type Accent = (typeof ACCENTS)[number]

export function pickAccent(): Accent {
  return ACCENTS[Math.floor(Math.random() * ACCENTS.length)]
}
