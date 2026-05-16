import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import AppChrome from './components/AppChrome'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart Tickets',
  description: 'Лучшие события Казахстана',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ru" className="dark" suppressHydrationWarning>
        <body>
          <AppChrome>{children}</AppChrome>
        </body>
      </html>
    </ClerkProvider>
  )
}