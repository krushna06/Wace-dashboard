'use client'

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useSession } from 'next-auth/react';
import { getGuildStats, GuildStats } from '@/services/api';

export default function GuildStatsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<GuildStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsData = await getGuildStats(params.id);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [params.id]);

  return (
    <AppLayout guildId={params.id} requesterId={session?.user?.id || ''} onOpenSpotlight={() => {}}>
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-bold">Guild Stats</h1>
          </div>
          {loading && <div className="text-zinc-400">Loading stats...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {stats && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-700 flex flex-col items-center min-w-[180px] shadow-lg">
                <span className="text-zinc-400 text-lg mb-2">Songs Played</span>
                <span className="text-4xl font-bold text-white">{stats.songsPlayed}</span>
              </div>
              <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-700 flex flex-col items-center min-w-[180px] shadow-lg">
                <span className="text-zinc-400 text-lg mb-2">Commands Executed</span>
                <span className="text-4xl font-bold text-white">{stats.commandsExecuted}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 