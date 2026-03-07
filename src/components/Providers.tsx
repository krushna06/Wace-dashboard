'use client'

import { SessionProvider } from 'next-auth/react';
import { GuildProvider } from '@/contexts/GuildContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GuildProvider>
        {children}
      </GuildProvider>
    </SessionProvider>
  );
} 