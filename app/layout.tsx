import './globals.css'
import type { Metadata } from 'next'
import type { Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'buildkaam - Skip The Paperwork Lets BUILDKAAM',
  description: 'Build For Builders, Engineers,Architectures, Contractors,Consultants.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} w-screen overflow-x-hidden`}>
        <AuthProvider>
          <div className="w-full max-w-[100vw] overflow-hidden relative">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}