import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RoleAuth - Role-Based Authentication System',
  description: 'Secure, scalable authentication system with customizable role management for individuals and industry teams',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
        <div className="w-full max-w-[100vw] overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}