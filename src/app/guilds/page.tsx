'use client'

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/components/UserProfile';
import { Search, Server, ListMusic, Compass } from 'lucide-react';
import axios from 'axios';
import { checkIfUserIsDJ, musicApi, checkIfUserIsPremium } from '@/services/api';
import { AppLayout } from '@/components/AppLayout';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { useGuilds } from '@/contexts/GuildContext';

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
  const { mutualGuilds, listeningGuilds, loading } = useGuilds();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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
    const isPremium = await checkIfUserIsPremium(userId);
    if (!isPremium) {
      setError('You are not a premium user. Access denied.');
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
      <AppLayout guildId={listeningGuilds[0]?.id} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight} hidePlayerControls={true} hideQueue={true}>
        <div className="max-w-7xl mx-auto">
          {listeningGuilds.length > 0 && (
            <>
              <h1 className="text-2xl font-bold mb-4">You are now listening in</h1>
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listeningGuilds.map((guild) => (
                    <div key={guild.id} className="bg-zinc-900 rounded-lg overflow-hidden flex flex-col p-0 max-w-sm">
                      <div className="relative h-20 w-full">
                        <img
                          src="/default-banner.svg"
                          alt="Banner"
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-t-lg"></div>
                      </div>
                      <div className="flex items-center justify-between gap-4 p-6">
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
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <h1 className="text-2xl font-bold mb-4">My servers</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mutualGuilds.map((guild) => (
                <div key={guild.id} className="bg-zinc-900 rounded-lg overflow-hidden flex flex-col p-0 max-w-sm">
                  <div className="relative h-20 w-full">
                    <img
                      src="/default-banner.svg"
                      alt="Banner"
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-t-lg"></div>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-6">
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