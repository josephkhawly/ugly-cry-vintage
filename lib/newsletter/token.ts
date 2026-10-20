import { createHmac, timingSafeEqual } from 'crypto'

type NewsletterConfirmPayload = {
  customerId: string
  exp: number
}

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24

function getSecret(): string {
  const secret = process.env.NEWSLETTER_CONFIRM_SECRET

  if (!secret) {
    throw new Error('Newsletter confirmation is not configured')
  }

  return secret
}

function toBase64Url(value: string | Buffer): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string): Buffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  return Buffer.from(padded + pad, 'base64')
}

function sign(payloadPart: string): string {
  return toBase64Url(createHmac('sha256', getSecret()).update(payloadPart).digest())
}

export function createNewsletterConfirmToken(customerId: string): string {
  const payload: NewsletterConfirmPayload = {
    customerId,
    exp: Date.now() + TOKEN_TTL_MS,
  }
  const payloadPart = toBase64Url(JSON.stringify(payload))
  return `${payloadPart}.${sign(payloadPart)}`
}

export function verifyNewsletterConfirmToken(
  token: string,
): NewsletterConfirmPayload | null {
  const [payloadPart, signaturePart] = token.split('.')
  if (!payloadPart || !signaturePart) {
    return null
  }

  const expected = sign(payloadPart)
  const provided = Buffer.from(signaturePart)
  const expectedBuf = Buffer.from(expected)

  if (
    provided.length !== expectedBuf.length ||
    !timingSafeEqual(provided, expectedBuf)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(payloadPart).toString('utf8'),
    ) as NewsletterConfirmPayload

    if (
      !payload.customerId ||
      typeof payload.exp !== 'number' ||
      payload.exp < Date.now()
    ) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
