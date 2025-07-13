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

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#121212] p-6 flex flex-col gap-3">
          {/* Server Selector */}
          <div className="relative">
            <button className="w-full flex items-center justify-between p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">?</span>
                </div>
                <span className="truncate text-sm font-medium text-zinc-400">
                  Select a server
                </span>
              </div>
            </button>
          </div>

          <hr className="border-zinc-800" />

          {/* Server Link */}
          <div className={`flex items-center gap-3 transition-colors px-3 py-2 rounded-lg text-white bg-zinc-800`}>
            <div className="w-6 h-6 flex-shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <span>Server</span>
          </div>
          <div className={`flex items-center gap-3 transition-colors px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800`}>
            <div className="w-6 h-6 flex-shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <span>Explore</span>
          </div>
          
          <hr className="border-zinc-800" />
          
          {/* Create Playlist Button */}
          <div className="mt-1">
            <button className="w-full bg-zinc-800 text-white px-3 py-2 rounded-2xl hover:bg-zinc-700 transition-colors text-sm font-medium mb-4 flex items-center gap-2">
              <ListMusic className="w-4 h-4" />
              Create Playlist
            </button>
            <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Your Playlists</h2>
            <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
              <li className="text-zinc-400 text-sm">No playlists available</li>
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Search */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-900">
            <div className="flex-1"></div>
            <div className="flex items-center max-w-4xl w-full">
              <div className="w-full bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg flex items-center gap-3">
                <Search className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for servers..."
                  className="flex-1 bg-transparent text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <UserProfile />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
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
          </div>
        </div>
      </div>
    </div>
  );
} 