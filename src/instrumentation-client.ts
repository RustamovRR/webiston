import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
  environment: process.env.NODE_ENV,
  debug: false,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
