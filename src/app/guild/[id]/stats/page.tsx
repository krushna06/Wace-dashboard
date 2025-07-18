'use client'

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useSession } from 'next-auth/react';
import {
  getGuildStats,
  getGuildTopSongs,
  getGuildTopUsers,
  getGuildLastPlayed,
  GuildStats,
  TopSong,
  TopUser,
  LastPlayedSong,
} from '@/services/api';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';

export default function GuildStatsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { isOpen, closeSpotlight, openSpotlight } = useSpotlightSearch();
  const [stats, setStats] = useState<GuildStats | null>(null);
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [lastPlayed, setLastPlayed] = useState<LastPlayedSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, topSongsData, topUsersData, lastPlayedData] = await Promise.all([
          getGuildStats(params.id),
          getGuildTopSongs(params.id),
          getGuildTopUsers(params.id),
          getGuildLastPlayed(params.id),
        ]);
        setStats(statsData);
        setTopSongs(topSongsData.topSongs || []);
        setTopUsers(topUsersData.topUsers || []);
        setLastPlayed(lastPlayedData.lastPlayed || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [params.id]);

  return (
    <>
      <SpotlightSearch 
        guildId={params.id} 
        isOpen={isOpen} 
        onClose={closeSpotlight} 
      />
    <AppLayout guildId={params.id} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-bold">Guild Stats</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 shadow-lg">
              <div className="text-zinc-400 text-lg mb-3 font-semibold">Top Songs</div>
              {topSongs.length > 0 ? (
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
              ) : (
                <div className="text-zinc-500 text-sm">No data</div>
              )}
            </div>
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 shadow-lg">
              <div className="text-zinc-400 text-lg mb-3 font-semibold">Top Users</div>
              {topUsers.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2">
                  {topUsers
                    .slice(0, 5)
                    .map((user) => (
                      <li key={user.userId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="font-semibold text-white">{user.username}</div>
                        <div className="flex items-center gap-4">
                          <span className="text-zinc-500 text-sm">Songs Played: {user.songsPlayed}</span>
                          <span className="text-zinc-500 text-sm">Commands: {user.commandsExecuted}</span>
                        </div>
                      </li>
                    ))}
                </ol>
              ) : (
                <div className="text-zinc-500 text-sm">No data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
    </>
  );
} 