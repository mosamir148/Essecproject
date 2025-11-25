import type { Metadata } from 'next'
import { ClientLayout } from '@/components/ClientLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'ESSEC Solar Engineering - Leading Solar Energy Solutions',
  description: 'Powering the future with sustainable solar technology',
  icons: {
    icon: '/logo.PNG',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}

