'use client'

import { useActionState } from 'react'
import {
  confirmNewsletterSubscription,
  type NewsletterConfirmFormState,
} from '@/app/actions/newsletter'
import { ConfirmMessage, ConfirmShell } from '@/components/NewsletterConfirmForm'

const initialState: NewsletterConfirmFormState = {
  message: '',
  status: 'idle',
  title: '',
}

export function NewsletterConfirmForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    confirmNewsletterSubscription,
    initialState,
  )

  if (state.status === 'success' || state.status === 'error') {
    return <ConfirmMessage body={state.message} title={state.title} />
  }

  return (
    <ConfirmShell>
      <h1 className='mb-4 not-italic text-2xl text-espresso'>Confirm your signup</h1>
      <p className='mb-8'>
        One click to finish — we&apos;ll only email when it matters.
      </p>
      <form action={formAction}>
        <input name='token' type='hidden' value={token} />
        <button
          className='bg-espresso px-6 py-3 not-italic text-white transition hover:bg-espresso/85 disabled:cursor-not-allowed disabled:opacity-70'
          disabled={pending}
          type='submit'
        >
          {pending ? 'Confirming…' : 'Confirm email'}
        </button>
      </form>
    </ConfirmShell>
  )
}
