export function getErrorMessage(status: number, code?: string): string {
  if (code === 'rate_limit') return 'Session limit reached. Refresh to start a new session.'
  if (status === 401) return 'API key not configured. Contact the site owner.'
  if (status === 429) return 'Too many requests. Wait a moment and try again.'
  return 'Something went wrong. Try again.'
}
