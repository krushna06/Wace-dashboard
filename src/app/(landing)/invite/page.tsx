'use client'

import { useEffect } from 'react'

export default function InvitePage() {
  useEffect(() => {
    window.location.replace('https://discord.com/oauth2/authorize?client_id=1221392528566386768')
  }, [])

  return null
}
