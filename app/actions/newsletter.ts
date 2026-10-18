'use server'

import { checkBotId } from 'botid/server'
import {
  buildNewsletterConfirmUrl,
  sendNewsletterConfirmationEmail,
} from '@/lib/newsletter/send-confirmation'
import { createNewsletterConfirmToken, verifyNewsletterConfirmToken } from '@/lib/newsletter/token'
import {
  confirmEmailMarketingSubscription,
  subscribeEmailToNewsletter,
} from '@/lib/shopify/newsletter'

export type NewsletterFormState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export type NewsletterConfirmFormState = {
  status: 'idle' | 'success' | 'error'
  title: string
  message: string
}

const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'+/=^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

const GENERIC_SIGNUP_SUCCESS =
  "You're in! Check your inbox to verify signup. <3"

export async function subscribeToNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const verification = await checkBotId()
  if (verification.isBot) {
    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    }
  }

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()

  if (!email || !EMAIL_REGEX.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' }
  }

  try {
    const result = await subscribeEmailToNewsletter(email)

    if (result.status !== 'already_subscribed') {
      const token = createNewsletterConfirmToken(result.customerId)
      await sendNewsletterConfirmationEmail({
        confirmUrl: buildNewsletterConfirmUrl(token),
        customerId: result.customerId,
        email,
      })
    }

    return {
      status: 'success',
      message: GENERIC_SIGNUP_SUCCESS,
    }
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    }
  }
}

export async function confirmNewsletterSubscription(
  _prevState: NewsletterConfirmFormState,
  formData: FormData,
): Promise<NewsletterConfirmFormState> {
  const token = String(formData.get('token') ?? '')

  if (!token) {
    return {
      status: 'error',
      title: 'Missing confirmation link',
      message:
        'That confirmation link looks incomplete. Try signing up again from the homepage.',
    }
  }

  const payload = verifyNewsletterConfirmToken(token)
  if (!payload) {
    return {
      status: 'error',
      title: 'Link expired or invalid',
      message:
        'This confirmation link is expired or invalid. Sign up again and we’ll send a fresh one.',
    }
  }

  try {
    const result = await confirmEmailMarketingSubscription(payload.customerId)

    switch (result) {
      case 'confirmed':
      case 'already_subscribed':
        return {
          status: 'success',
          title: "You're in!",
          message:
            'Email confirmed. You’ll get first dibs on drops and that welcome discount. <3',
        }
      case 'rejected':
        return {
          status: 'error',
          title: 'Unable to confirm',
          message:
            'This confirmation link can’t be used anymore. Sign up again from the homepage if you still want in.',
        }
      default: {
        const _exhaustive: never = result
        return _exhaustive
      }
    }
  } catch (error) {
    console.error('Newsletter confirmation error:', error)
    return {
      status: 'error',
      title: 'Something went wrong',
      message: 'We couldn’t confirm your signup. Please try again in a bit.',
    }
  }
}
