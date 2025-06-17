'use client'

import { tracker } from '@openreplay/tracker'
import { useEffect } from 'react'

tracker.configure({
  projectKey: process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY,
  __DISABLE_SECURE_MODE: true,
})

tracker.setUserID('john@doe.com')

const Openreplay = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      tracker.start()
    }
  }, [])

  return null
}

export default Openreplay
