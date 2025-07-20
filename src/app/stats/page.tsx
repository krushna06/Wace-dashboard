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
            {loading && <div className="text-zinc-400">Loading stats...</div>}
            {error && <div className="text-red-400">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-700 flex flex-col items-center shadow-lg">
                <span className="text-zinc-400 text-lg mb-2">Songs Played</span>
                <span className="text-4xl font-bold text-white">{stats?.songsPlayed ?? '--'}</span>
              </div>
              <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-700 flex flex-col items-center shadow-lg">
                <span className="text-zinc-400 text-lg mb-2">Commands Executed</span>
                <span className="text-4xl font-bold text-white">{stats?.commandsExecuted ?? '--'}</span>
              </div>
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 flex flex-col items-center shadow-lg min-h-[120px] justify-center">
                <div className="text-zinc-400 text-lg mb-1">Last Played Song</div>
                {lastPlayed ? (
                  <>
                    <div className="text-center">
                      <div className="text-base font-semibold text-white truncate max-w-[180px]">{lastPlayed.title}</div>
                      <div className="text-zinc-400 text-sm truncate max-w-[180px]">by {lastPlayed.author}</div>
                      <div className="text-zinc-500 text-xs mt-1">{new Date(lastPlayed.playedAt).toLocaleString()}</div>
                      <a href={lastPlayed.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs mt-2 inline-block hover:text-blue-300 transition-colors" style={{ textDecoration: 'none' }}>Open Song</a>
                    </div>
                  </>
                ) : (
                  <div className="text-zinc-500 text-sm">No song played yet</div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 shadow-lg max-w-2xl mx-auto">
              <div className="text-zinc-400 text-lg mb-3 font-semibold">Your Top Songs</div>
              {(() => {
                if (topSongs.length > 0) {
                  return (
                    <ol className="list-decimal list-inside space-y-4">
                      {topSongs.slice(0, 5).map((song) => (
                        <li key={song.songId} className="flex flex-col gap-1 p-3 bg-zinc-800/40 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-semibold text-white truncate block">{song.title}</span>
                              <span className="text-zinc-400 text-sm truncate block">by {song.author}</span>
                            </div>
                            <a href={song.uri} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:text-blue-300 transition-colors" title="Open Song">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6m7-5v6m0 0L10 21m7-7h-6" />
                              </svg>
                            </a>
                          </div>
                          <div className="text-zinc-500 text-xs mt-1">Plays: {song.playCount}</div>
                        </li>
                      ))}
                    </ol>
                  );
                } else {
                  return <div className="text-zinc-500 text-sm">No songs played yet</div>;
                }
              })()}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
} 