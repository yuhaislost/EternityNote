import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eternity',
  description: 'Internalise, think and create; a tool to success.',
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/eternity_bg_r_none.svg",
        href: "/eternity_bg_r_none.svg"
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/eternity_bg_r_none.svg",
        href: "/eternity_bg_r_none.svg"
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange
        storageKey='eternity-theme'
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
