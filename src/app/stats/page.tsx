'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/AppLayout';
import { 
  getUserStats, 
  getUserTopSongs, 
  getUserLastPlayed,
  UserStats, 
  TopSong, 
  LastPlayedSong 
} from '@/services/api';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';

export default function StatsPage() {
  const { data: session, status } = useSession();
  const { isOpen, openSpotlight, closeSpotlight } = useSpotlightSearch();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [lastPlayed, setLastPlayed] = useState<LastPlayedSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    const userId = session.user.id;
    if (!userId) return;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, topSongsData, lastPlayedData] = await Promise.all([
          getUserStats(userId),
          getUserTopSongs(userId),
          getUserLastPlayed(userId),
        ]);
        console.log('Stats data:', statsData);
        console.log('Top songs data:', topSongsData);
        console.log('Last played data:', lastPlayedData);
        
        setStats(statsData);
        setTopSongs(topSongsData.topSongs || []);
        setLastPlayed(lastPlayedData.lastPlayed || null);
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [status, session]);

  return (
    <>
      <SpotlightSearch guildId="" isOpen={isOpen} onClose={closeSpotlight} />
      <AppLayout guildId={undefined} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-3xl font-bold">Your Stats</h1>
            </div>
            {loading && !stats && <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} /></div>}
            {error && <div className="text-red-400">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-8 rounded-xl flex flex-col items-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <span className="text-[#BCC3D7] text-lg mb-2">Songs Played</span>
                <span className="text-4xl font-bold text-white">{stats?.songsPlayed ?? '--'}</span>
              </div>
              <div className="p-8 rounded-xl flex flex-col items-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <span className="text-[#BCC3D7] text-lg mb-2">Commands Executed</span>
                <span className="text-4xl font-bold text-white">{stats?.commandsExecuted ?? '--'}</span>
              </div>
              <div className="p-6 rounded-xl flex flex-col items-center min-h-[120px] justify-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="text-[#BCC3D7] text-lg mb-1">Last Played Song</div>
                {lastPlayed ? (
                  <div className="text-center">
                    <div className="text-base font-semibold text-white truncate max-w-[180px]">{lastPlayed.title}</div>
                    <div className="text-[#BCC3D7] text-sm truncate max-w-[180px]">by {lastPlayed.author}</div>
                    <div className="text-zinc-500 text-xs mt-1">{new Date(lastPlayed.playedAt).toLocaleString()}</div>
                    <a href={lastPlayed.uri} target="_blank" rel="noopener noreferrer" className="text-xs mt-2 inline-block transition-colors" style={{ color: 'var(--color-primary)' }}>Open Song</a>
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm">No song played yet</div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-xl max-w-2xl mx-auto" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="text-[#BCC3D7] text-lg mb-3 font-semibold">Your Top Songs</div>
              {topSongs.length > 0 ? (
                <ol className="list-decimal list-inside space-y-4">
                  {topSongs.slice(0, 5).map((song) => (
                    <li key={song.songId} className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-semibold text-white truncate block">{song.title}</span>
                          <span className="text-[#BCC3D7] text-sm truncate block">by {song.author}</span>
                        </div>
                        <a href={song.uri} target="_blank" rel="noopener noreferrer" className="ml-2 transition-colors flex-shrink-0" style={{ color: 'var(--color-primary)' }} title="Open Song">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6m7-5v6m0 0L10 21m7-7h-6" />
                          </svg>
                        </a>
                      </div>
                      <div className="text-zinc-500 text-xs mt-1">Plays: {song.playCount}</div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-zinc-500 text-sm">No songs played yet</div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
} 