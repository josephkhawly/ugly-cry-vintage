import Link from 'next/link'
import type { ReactNode } from 'react'

export function ConfirmShell({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-[70vh] items-center justify-center px-6'>
      <article className='font-body w-full max-w-xl text-left text-lg leading-relaxed italic md:text-xl'>
        {children}
      </article>
    </div>
  )
}

export function ConfirmMessage({ body, title }: { body: string; title: string }) {
  return (
    <ConfirmShell>
      <h1 className='text-espresso mb-4 text-2xl not-italic'>{title}</h1>
      <p className='mb-8'>{body}</p>
      <p>
        <Link
          className='hover:text-espresso underline underline-offset-4 transition-colors'
          href='/'
        >
          Back home
        </Link>
      </p>
    </ConfirmShell>
  )
}

export { NewsletterConfirmForm } from '@/components/NewsletterConfirmForm-client'
