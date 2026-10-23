import * as Sentry from '@sentry/nextjs'
import { initBotId } from 'botid/client/core'

const SENTRY_TUNNEL_PATH = '/monitoring'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
})

const fetchWithoutBotId = globalThis.fetch.bind(globalThis)

initBotId({
  protect: [
    {
      method: 'POST',
      path: '/*',
    },
  ],
})

const fetchWithBotId = globalThis.fetch

// BotID `/*` POST would otherwise challenge same-origin Sentry tunnel envelopes.
globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.href)
  if (url.pathname === SENTRY_TUNNEL_PATH || url.pathname === `${SENTRY_TUNNEL_PATH}/`) {
    return fetchWithoutBotId(input, init)
  }

  return fetchWithBotId(input, init)
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
