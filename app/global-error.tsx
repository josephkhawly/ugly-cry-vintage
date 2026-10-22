'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

import './globals.css'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang='en'>
      <body className='bg-white text-espresso'>
        <div className='container mx-auto px-6 pt-16 pb-16 text-center sm:pt-24'>
          <title>Something went wrong</title>
          <h1 className='font-frogmore text-espresso text-4xl tracking-wide'>
            Something went wrong
          </h1>
          <p className='font-subheading text-espresso/80 mt-4 text-lg'>Please try again.</p>
          <button
            className='border-espresso bg-teal/50 font-subheading text-espresso mt-8 inline-flex cursor-pointer rounded-full border px-8 py-3 text-sm tracking-wide uppercase hover:opacity-90'
            onClick={() => unstable_retry()}
            type='button'
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
