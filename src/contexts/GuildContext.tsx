'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { musicApi } from '@/services/api';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface GuildContextType {
  guilds: Guild[];
  mutualGuilds: Guild[];
  listeningGuilds: Guild[];
  loading: boolean;
  refreshGuilds: () => Promise<void>;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export function GuildProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [mutualGuilds, setMutualGuilds] = useState<Guild[]>([]);
  const [listeningGuilds, setListeningGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGuilds = async () => {
    if (!session?.accessToken || !session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch guilds');

      const data = await response.json();
      setGuilds(data);

      const results = await Promise.all(
        data.map(async (guild: Guild) => {
          try {
            const checker = await musicApi.checkUserAndBotInGuild(guild.id, session.user?.id || '');
            return { guild, ...checker };
          } catch {
            return { guild, inGuild: false, inSameVoice: false };
          }
        })
      );

      const listening = results.filter(r => r.inGuild && r.inSameVoice).map(r => r.guild);
      const mutual = results.filter(r => r.inGuild).map(r => r.guild);
      
      setListeningGuilds(listening);
      setMutualGuilds(mutual);
    } catch (error) {
      console.error('Failed to fetch guilds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken && session?.user?.id) {
      fetchGuilds();
    }
  }, [session?.accessToken, session?.user?.id]);

  return (
    <GuildContext.Provider value={{ guilds, mutualGuilds, listeningGuilds, loading, refreshGuilds: fetchGuilds }}>
      {children}
    </GuildContext.Provider>
  );
}

export function useGuilds() {
  const context = useContext(GuildContext);
  if (context === undefined) {
    throw new Error('useGuilds must be used within a GuildProvider');
  }
  return context;
}
