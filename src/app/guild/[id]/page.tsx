'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';
import { musicApi, type Track } from '@/services/api';
import { Play, Music } from 'lucide-react';
import axios from 'axios';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

interface RecentlyPlayedTrack extends Track {
  playedAt: number;
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

const RECENTLY_PLAYED_KEY = 'wace_recently_played';
const MAX_RECENTLY_PLAYED = 50;

const getRecentlyPlayed = (): RecentlyPlayedTrack[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load recently played songs:', error);
    return [];
  }
};

const addRecentlyPlayed = (track: Track): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const recentlyPlayed = getRecentlyPlayed();
    
    const filtered = recentlyPlayed.filter(t => t.uri !== track.uri);
    
    const newTrack: RecentlyPlayedTrack = {
      ...track,
      playedAt: Date.now()
    };
    
    const updated = [newTrack, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recently played song:', error);
  }
};

const notifyTrackPlayed = (track: Track) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trackPlayed', { detail: track }));
  }
};

const originalPlayTrack = musicApi.playTrack;
musicApi.playTrack = async (guildId: string, userId: string, search: string): Promise<void> => {
  try {
    await originalPlayTrack(guildId, userId, search);
    
    try {
      const searchResults = await musicApi.search(search, 'youtube');
      if (searchResults.length > 0) {
        const track = searchResults[0];
        addRecentlyPlayed(track);
        notifyTrackPlayed(track);
      }
    } catch (searchError) {
      console.error('Failed to cache track info:', searchError);
    }
  } catch (error) {
    console.error('Failed to play track:', error);
    throw error;
  }
};

export default function GuildPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isOpen, closeSpotlight, openSpotlight } = useSpotlightSearch();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [djChecked, setDjChecked] = useState(false);
  const [isDJ, setIsDJ] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'loading') return;

    const checkDJAndPremium = async () => {
      const userId = session?.user?.id;
      const guildId = params.id;
      if (!userId || !guildId) {
        setError('Missing user or guild ID.');
        setIsLoading(false);
        setIsDJ(false);
        setDjChecked(true);
        setIsPremium(false);
        setPremiumChecked(true);
        return;
      }

      try {
        const response = await fetch('/api/auth/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guildId }),
        });

        if (!response.ok) {
          setError('Authorization check failed.');
          setIsLoading(false);
          setDjChecked(true);
          setPremiumChecked(true);
          return;
        }

        const result = await response.json();
        setIsDJ(result.isDJ);
        setDjChecked(true);

        if (!result.isDJ) {
          setError('You are not a DJ in this server. Access denied.');
          setIsLoading(false);
          return;
        }

        setIsPremium(result.isPremium);
        setPremiumChecked(true);

        if (!result.isPremium) {
          setError('You are not a premium user. Access denied.');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Authorization check error:', error);
        setError('Failed to verify authorization.');
        setIsLoading(false);
        setDjChecked(true);
        setPremiumChecked(true);
      }
    };

    checkDJAndPremium();
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

    fetchGuildData();
  }, [djChecked, isDJ, session?.accessToken, params.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchHistory = async () => {
      const history = await musicApi.getUserHistory(String(session.user.id));
      setRecentlyPlayed(history);
    };
    fetchHistory();
  }, [session?.user?.id]);

  useEffect(() => {

    
    return () => {
      
    };
  }, []);

  const handlePlayTrack = async (track: any) => {
    if (!session?.user?.id) {
      console.error('User ID is missing. Cannot play track.');
      return;
    }
    try {
      await musicApi.playTrack(params.id, session.user.id, track.title);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const formatPlayedAt = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (status === 'loading' || isLoading || !djChecked || !premiumChecked) {
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
        guildId={guild?.id} 
        isOpen={isOpen} 
        onClose={closeSpotlight} 
      />
      <AppLayout guildId={guild?.id} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 text-zinc-400">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Recently Played</h1>
                <p className="text-zinc-400">Your music listening history</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {recentlyPlayed.length > 0 ? recentlyPlayed.map((track) => {
                const fallback = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
                const imageSrc = typeof track.image === 'string' && track.image ? track.image : fallback;
                return (
                  <div 
                    key={track.songId}
                    className="group bg-zinc-900/50 rounded-lg p-4 hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="relative mb-4">
                      <img 
                        src={imageSrc || fallback}
                        alt={track.title}
                        className="w-full aspect-square object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                        <div className="bg-white text-black rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-zinc-400 text-sm truncate">
                      {track.author}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Plays: {track.playCount}
                    </p>
                  </div>
                );
              }) : (
                <div className="text-center text-zinc-400 py-8 col-span-full">
                  No recently played songs. Start playing some music!
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
} 