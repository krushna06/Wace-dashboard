'use client'

import { useEffect } from 'react'
import { BOT_NAME, BOT_LOGO, INVITE_URL, SITE_MAIL } from '@/lib/botConfig'

export default function InvitePage() {
  useEffect(() => {
    window.location.replace(INVITE_URL!)
  }, [])

  return null
}
