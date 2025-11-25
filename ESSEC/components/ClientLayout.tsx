'use client'

import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import { ReactNode } from 'react'

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </Providers>
  )
}

