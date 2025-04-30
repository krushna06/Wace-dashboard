'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/components/UserProfile';

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
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Failed to fetch guilds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuilds();
  }, [session?.accessToken]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-between p-4 border-b border-zinc-900">
        <h1 className="text-xl font-bold">Wace Dashboard</h1>
        <UserProfile />
      </div>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Your Servers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((guild) => (
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
              <Link
                href={`/guild/${guild.id}`}
                className="bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 