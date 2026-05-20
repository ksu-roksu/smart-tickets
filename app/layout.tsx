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
      <html lang="ru" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var t = localStorage.getItem('dash_theme') || 'dark';
                  if (t === 'dark') document.documentElement.classList.add('dark');
                } catch(e) {}
              `,
            }}
          />
        </head>
        <body>
          <AppChrome>{children}</AppChrome>
        </body>
      </html>
    </ClerkProvider>
  )
}