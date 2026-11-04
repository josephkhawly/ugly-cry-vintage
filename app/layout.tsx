import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script'
import { Suspense } from 'react'

import { AppShell } from './app-shell'
import './globals.css'

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-roboto',
})

const frogmore = localFont({
  src: '../public/ED-Frogmore-Regular.otf',
  display: 'swap',
  variable: '--font-frogmore',
})

export const metadata: Metadata = {
  title: 'Ugly Cry Vintage',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className='scrollbar-gutter-stable overflow-x-clip' lang='en'>
      <body
        className={`${roboto.variable} ${frogmore.variable} bg-white font-body text-espresso overflow-x-clip`}
      >
        <Script
          src='https://cdn.shopify.com/storefront/standard-actions.js'
          strategy='afterInteractive'
          type='module'
        />
        <Suspense fallback={null}>
          <AppShell>{children}</AppShell>
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
