import {
  ConfirmMessage,
  NewsletterConfirmForm,
} from '@/components/NewsletterConfirmForm'
import { verifyNewsletterConfirmToken } from '@/lib/newsletter/token'

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type ConfirmPageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function NewsletterConfirmPage({
  searchParams,
}: ConfirmPageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <ConfirmMessage
        title='Missing confirmation link'
        body='That confirmation link looks incomplete. Try signing up again from the homepage.'
      />
    )
  }

  const payload = verifyNewsletterConfirmToken(token)
  if (!payload) {
    return (
      <ConfirmMessage
        title='Link expired or invalid'
        body='This confirmation link is expired or invalid. Sign up again and we’ll send a fresh one.'
      />
    )
  }

  return <NewsletterConfirmForm token={token} />
}
