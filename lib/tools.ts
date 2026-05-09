import { tool } from 'ai'
import { z } from 'zod'
import { searchDocuments } from './vectorStore'
import { profileData } from './profileData'
import { KEYWORD_CHIPS } from './suggestions'

export const tools = {
  searchKnowledge: tool({
    description:
      'Search the personal knowledge base for open-ended or contextual questions ' +
      'about experience, background, approach, or anything not covered by the ' +
      'structured tools. Use this for fuzzy, narrative questions.',
    inputSchema: z.object({
      query: z.string().describe('The search query derived from the user question'),
    }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchDocuments(query)
      if (results.length === 0) {
        return 'No relevant information found in the knowledge base.'
      }
      return results.map((r) => r.content).join('\n\n---\n\n')
    },
  }),

  getProjects: tool({
    description:
      'Get a structured list of projects with descriptions, tech stack, and highlights. ' +
      'Use when asked about portfolio work, side projects, or what has been built.',
    inputSchema: z.object({}),
    execute: async () => profileData.projects,
  }),

  getSkills: tool({
    description:
      'Get technical skills organised by category. Use when asked about tech stack, ' +
      'languages, frameworks, or tooling.',
    inputSchema: z.object({}),
    execute: async () => profileData.skills,
  }),

  getExperience: tool({
    description:
      'Get work experience history including roles, companies, and focus areas. ' +
      'Use when asked about career background, employment, or work history.',
    inputSchema: z.object({}),
    execute: async () => profileData.experience,
  }),

  getContact: tool({
    description:
      'Get contact information and professional links. Use when asked how to get ' +
      'in touch, connect, or reach out.',
    inputSchema: z.object({}),
    execute: async () => profileData.contact,
  }),

  getSuggestedQuestions: tool({
    description:
      'Return 2–3 contextually relevant follow-up questions the visitor might want ' +
      'to ask next, based on the current topic. Call this at the end of a response ' +
      'to generate chip suggestions.',
    inputSchema: z.object({
      topic: z.string().describe(
        'One or two keywords describing the current conversation topic, ' +
        'e.g. "mcp", "java", "projects", "singapore"'
      ),
    }),
    execute: async ({ topic }: { topic: string }) => {
      const key = topic.toLowerCase()
      for (const [keyword, chips] of Object.entries(KEYWORD_CHIPS)) {
        if (key.includes(keyword)) return chips
      }
      return [
        'What do you work on currently?',
        'Tell me about a project',
        'Are you open to work?',
      ]
    },
  }),
}
