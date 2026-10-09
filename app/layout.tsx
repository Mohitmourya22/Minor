import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import AuthTokenBridge from '../components/AuthTokenBridge'
import { FamilyProvider } from '../lib/family/FamilyContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'AyuMarg — We care', template: '%s · AyuMarg' },
  description:
    'AyuMarg is a calm digital space for families to manage care profiles, health vitals, medical records and healthcare bookings in one place.',
  openGraph: {
    title: 'AyuMarg — We care',
    description: 'Care, connected. Simple enough for everyone.',
    siteName: 'AyuMarg',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ClerkProvider afterSignOutUrl="/">
          <AuthTokenBridge />
          <FamilyProvider>{children}</FamilyProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
