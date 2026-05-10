import profileJson from '../data/profile.json'

export interface Project {
  name: string
  description: string
  tech: string[]
  url: string | null
  highlights: string[]
}

export interface Skills {
  languages: string[]
  frameworks: string[]
  ai_and_agents: string[]
  cloud_and_devops: string[]
  databases: string[]
  tools: string[]
  domain: string[]
}

export interface Experience {
  company: string
  role: string
  location: string
  period: string
  focus: string
}

export interface Contact {
  linkedin: string
  email: string
  github: string
  location: string
}

export interface ProfileData {
  projects: Project[]
  skills: Skills
  experience: Experience[]
  contact: Contact
}

export const profileData = profileJson as ProfileData
