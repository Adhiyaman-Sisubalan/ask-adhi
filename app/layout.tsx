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
  metadataBase: new URL('https://ask-adhi.vercel.app'),
  openGraph: {
    title: 'ask-adhi',
    description:
      'A terminal-style portfolio chatbot. Ask me anything about my work, ' +
      'projects, and experience.',
    url: 'https://ask-adhi.vercel.app',
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
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',s||p);})();`,
          }}
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
