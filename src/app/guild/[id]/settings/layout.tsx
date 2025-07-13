'use client';
import { AppLayout } from '@/components/AppLayout';
import { useSession } from 'next-auth/react';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';

export default function GuildSettingsLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const { data: session } = useSession();
  const { openSpotlight } = useSpotlightSearch();
  return (
    <AppLayout guildId={params.id} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
      {children}
    </AppLayout>
  );
} 