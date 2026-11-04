import { Suspense } from 'react'

import {
  ConfirmMessage,
  NewsletterConfirmForm,
} from '@/components/NewsletterConfirmForm'
import { verifyNewsletterConfirmToken } from '@/lib/newsletter/token'

type ConfirmPageProps = {
  searchParams: Promise<{ token?: string }>
}

async function ConfirmContent({ searchParams }: ConfirmPageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <ConfirmMessage
        body='That confirmation link looks incomplete. Try signing up again from the homepage.'
        title='Missing confirmation link'
      />
    )
  }

  const payload = verifyNewsletterConfirmToken(token)
  if (!payload) {
    return (
      <ConfirmMessage
        body='This confirmation link is expired or invalid. Sign up again and we’ll send a fresh one.'
        title='Link expired or invalid'
      />
    )
  }

  return <NewsletterConfirmForm token={token} />
}

export default function NewsletterConfirmPage({ searchParams }: ConfirmPageProps) {
  return (
    <Suspense
      fallback={
        <ConfirmMessage body='Checking your confirmation link…' title='Confirming…' />
      }
    >
      <ConfirmContent searchParams={searchParams} />
    </Suspense>
  )
}
