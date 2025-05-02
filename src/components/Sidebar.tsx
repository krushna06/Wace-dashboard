'use client'

import { Home, Search, ListMusic } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { musicApi, type Playlist } from '@/services/api';

const GUILD_ID = '877062059966206002';

export function Sidebar({ guildId }: { guildId?: string }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const playlistsData = await musicApi.getPlaylists(GUILD_ID);
        setPlaylists(playlistsData);
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="w-64 bg-zinc-950 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
        <Home className="w-6 h-6" />
        <Link href={guildId ? `/guild/${guildId}` : "/"} className="hover:text-white transition-colors">Home</Link>
      </div>
      <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
        <Search className="w-6 h-6" />
        <Link href={guildId ? `/guild/${guildId}/search` : "/search"} className="hover:text-white transition-colors">Search</Link>
      </div>
      
      <div className="mt-6">
        <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Your Playlists</h2>
        <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="text-zinc-400 hover:text-white transition-colors cursor-pointer truncate">
              <Link href={guildId ? `/guild/${guildId}/playlist/${playlist.id}` : `/playlist/${playlist.id}`} className="flex items-center gap-2">
                <ListMusic className="w-4 h-4" />
                <span>{playlist.name}</span>
                <span className="text-xs text-zinc-600">({playlist.trackCount})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 