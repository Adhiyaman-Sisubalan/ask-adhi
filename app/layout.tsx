import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'ask-adhi',
  description:
    'Ask me anything about my work, projects, and experience. ' +
    'Software developer in Singapore — agentic AI, fintech, Java, React.',
  metadataBase: new URL('https://adhiyaman-sisubalan.com'),
  openGraph: {
    title: 'ask-adhi',
    description:
      'Terminal-style portfolio chatbot. Ask me anything about my work in agentic AI, ' +
      'fintech, and enterprise engineering — based in Singapore.',
    url: 'https://adhiyaman-sisubalan.com',
    siteName: 'ask-adhi',
    locale: 'en_SG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ask-adhi',
    description:
      'A terminal-style portfolio chatbot. Ask me anything about my work, ' +
      'projects, and experience.',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Adhiyaman Sisubalan',
    alternateName: 'Adhi',
    url: 'https://adhiyaman-sisubalan.com',
    jobTitle: 'Software Engineer',
    description:
      'Software developer based in Singapore specialising in agentic AI engineering, ' +
      'enterprise fintech systems, MCP servers, and multi-agent pipelines.',
    knowsAbout: [
      'Agentic AI',
      'MCP Servers',
      'LangGraph',
      'Multi-agent Pipelines',
      'Enterprise Fintech',
      'Java',
      'Spring Framework',
      'React',
      'TypeScript',
      'Next.js',
    ],
    workLocation: {
      '@type': 'Place',
      name: 'Singapore',
    },
    sameAs: [
      'https://github.com/Adhiyaman-Sisubalan',
      'https://www.linkedin.com/in/adhiyaman-sisubalan/',
    ],
  }

  return (
    <html lang="en" className={`${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',s||p);})();`,
          }}
        />
        {/* JSON-LD structured data — Person schema for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full overflow-hidden">
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
