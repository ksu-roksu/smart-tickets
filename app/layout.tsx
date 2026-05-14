import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import Navbar from './components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Tickets',
  description: 'Лучшие события Казахстана',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ru" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Navbar />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}