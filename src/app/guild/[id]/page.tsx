'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';
import { musicApi, type Track, checkIfUserIsDJ } from '@/services/api';
import { Play } from 'lucide-react';
import axios from 'axios';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const data = await response.json();
        const retryAfter = data.retry_after * 1000;
        console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
        await sleep(retryAfter);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i));
    }
  }
  
  throw new Error('Max retries reached');
}

export default function GuildPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isOpen, closeSpotlight, openSpotlight } = useSpotlightSearch();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [djChecked, setDjChecked] = useState(false);
  const [isDJ, setIsDJ] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'loading') return;

    const checkDJ = async () => {
      const userId = session?.user?.id;
      const guildId = params.id;
      if (!userId || !guildId) {
        setError('Missing user or guild ID.');
        setIsLoading(false);
        setIsDJ(false);
        setDjChecked(true);
        return;
      }
      const isDJ = await checkIfUserIsDJ(guildId, userId);
      if (!isDJ) {
        setError('You are not a DJ in this server. Access denied.');
        setIsLoading(false);
        setIsDJ(false);
        setDjChecked(true);
        return;
      }
      setIsDJ(true);
      setDjChecked(true);
    };

    checkDJ();
  }, [session?.user?.id, params.id, status]);

  useEffect(() => {
    if (!djChecked || !isDJ) return;
    if (!session?.accessToken) {
      setIsLoading(false);
      setError('No session token available');
      return;
    }
    const fetchGuildData = async () => {
      try {
        const response = await fetchWithRetry(
          `https://discord.com/api/users/@me/guilds`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch guilds: ${response.status} ${errorText}`);
        }
        const guilds = await response.json();
        const currentGuild = guilds.find((g: Guild) => g.id === params.id);
        if (!currentGuild) {
          setError(`Guild not found or you do not have access to it. Guild ID: ${params.id}`);
          setIsLoading(false);
          return;
        }
        setGuild(currentGuild);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch guild information');
      } finally {
        setIsLoading(false);
      }
    };
    const fetchQueue = async () => {
      try {
        const queueData = await musicApi.getQueue(params.id);
        setQueue(queueData);
      } catch (error) {
        // ignore
      }
    };
    fetchGuildData();
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [djChecked, isDJ, session?.accessToken, params.id]);

  if (status === 'loading' || isLoading || !djChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-zinc-400">{error}</p>
          <button
            onClick={() => router.push('/guilds')}
            className="mt-4 bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Back to Guilds
          </button>
        </div>
      </div>
    );
  }

  if (!guild) {
    return null;
  }

  return (
    <>
      <SpotlightSearch 
        guildId={guild.id} 
        isOpen={isOpen} 
        onClose={closeSpotlight} 
      />
      <AppLayout guildId={guild.id} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
        <div className="flex-1 flex flex-col h-full">
        <div className="flex-none p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              {guild.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                  alt={guild.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-2xl font-bold">{guild.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{guild.name}</h1>
                <p className="text-zinc-400">Music Player</p>
                <p className="text-zinc-500 text-sm">Press Ctrl+K to search</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 pt-0 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full">
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Upcoming Songs</h2>
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : queue.length > 0 ? (
                <div className="flex-1 overflow-y-auto scrollbar-custom pr-2">
                  <div className="space-y-2">
                    {queue.map((track, index) => (
                      <div key={`${track.uri}-${index}`} className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors group">
                        <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                          <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{track.title}</h3>
                          <p className="text-zinc-400 text-sm truncate">{track.author}</p>
                        </div>
                        <div className="text-zinc-400 text-sm">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-400 py-8">
                  No upcoming songs in the queue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </AppLayout>
    </>
  );
} 