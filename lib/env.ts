const REQUIRED_VARS = [
  'ANTHROPIC_API_KEY',
  'VOYAGE_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
] as const

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n` +
        `Add them to .env.local (local) or Vercel dashboard (production).`
    )
  }
}
