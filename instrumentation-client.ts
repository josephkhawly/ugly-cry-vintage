import * as Sentry from '@sentry/nextjs'
import { initBotId } from 'botid/client/core'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
})

initBotId({
  protect: [
    {
      path: '/*',
      method: 'POST',
    },
  ],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
