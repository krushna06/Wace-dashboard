'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { musicApi } from '@/services/api';

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
        const retryAfter = data.retry_after * 1000; // Convert to milliseconds
        console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
        await sleep(retryAfter);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
  
  throw new Error('Max retries reached');
}

export default function GuildPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchGuild = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        setError('No session token available');
        return;
      }

      try {
        console.log('Fetching guilds with token:', session.accessToken);
        const response = await fetchWithRetry(
          `https://discord.com/api/users/@me/guilds`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch guilds: ${response.status} ${errorText}`);
        }

        const guilds = await response.json();
        console.log('Fetched guilds:', guilds);
        
        const currentGuild = guilds.find((g: Guild) => g.id === params.id);
        console.log('Looking for guild ID:', params.id);
        console.log('Found guild:', currentGuild);

        if (!currentGuild) {
          setError(`Guild not found or you do not have access to it. Guild ID: ${params.id}`);
          setLoading(false);
          return;
        }

        setGuild(currentGuild);
      } catch (error) {
        console.error('Failed to fetch guild:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch guild information');
      } finally {
        setLoading(false);
      }
    };

    fetchGuild();
  }, [session?.accessToken, params.id]);

  if (status === 'loading' || loading) {
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
    <AppLayout guildId={guild.id} requesterId={session?.user?.id || ''}>
      <div className="flex-1 p-8">
        <div className="flex items-center gap-4 mb-8">
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
          </div>
        </div>
        {/* Add your music player components here */}
      </div>
    </AppLayout>
  );
} 