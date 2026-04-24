'use client'

import { AppLayout } from '@/components/AppLayout'
import { useSession } from 'next-auth/react'
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { openSpotlight } = useSpotlightSearch()
  return (
    <AppLayout requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight} hidePlayerControls hideQueue>
      {children}
    </AppLayout>
  )
}
