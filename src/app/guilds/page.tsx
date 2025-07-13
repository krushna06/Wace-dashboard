'use client'

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/components/UserProfile';
import { Search, Server, ListMusic, Compass } from 'lucide-react';
import axios from 'axios';
import { checkIfUserIsDJ } from '@/services/api';
import { AppLayout } from '@/components/AppLayout';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';
import { SpotlightSearch } from '@/components/SpotlightSearch';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export default function GuildsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isOpen, closeSpotlight, openSpotlight } = useSpotlightSearch();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [filteredGuilds, setFilteredGuilds] = useState<Guild[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchGuilds = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch guilds');

        const data = await response.json();
        setGuilds(data);
        setFilteredGuilds(data);
      } catch (error) {
        console.error('Failed to fetch guilds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuilds();
  }, [session?.accessToken]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGuilds(guilds);
    } else {
      const filtered = guilds.filter(guild =>
        guild.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGuilds(filtered);
    }
  }, [searchQuery, guilds]);

  const handleGuildClick = async (guildId: string) => {
    setError(null);
    const userId = session?.user?.id;
    if (!userId) {
      setError('No user ID found in session.');
      return;
    }
    const isDJ = await checkIfUserIsDJ(guildId, userId);
    if (!isDJ) {
      setError('You are not a DJ in this server. Access denied.');
      return;
    }
    router.push(`/guild/${guildId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <SpotlightSearch 
        guildId="" 
        isOpen={isOpen} 
        onClose={closeSpotlight} 
      />
      <AppLayout guildId={undefined} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Servers</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuilds.map((guild) => (
              <div key={guild.id} className="bg-zinc-900 rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {guild.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                      alt={guild.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-xl font-bold">{guild.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold">{guild.name}</h2>
                    <p className="text-zinc-400 text-sm">
                      {guild.owner ? 'Owner' : 'Member'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleGuildClick(guild.id)}
                  className="bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </div>
          {error && (
            <div className="text-red-500 text-center mt-4">{error}</div>
          )}
        </div>
      </AppLayout>
    </>
  );
} 