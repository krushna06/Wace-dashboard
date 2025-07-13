'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { checkIfUserIsDJ } from '@/services/api';
import { ListMusic, Home, Server, Compass, Search, ChevronLeft, ChevronRight, ChevronDown, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface Playlist {
  id: string;
  name: string;
  trackCount: number;
}

const Sidebar = ({ playlists, guildId, onOpenSpotlight, isCollapsed, onToggle }: { 
  playlists: Playlist[]; 
  guildId?: string; 
  onOpenSpotlight: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [currentGuild, setCurrentGuild] = useState<Guild | null>(null);
  const [showGuildDropdown, setShowGuildDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const current = data.find((guild: Guild) => guild.id === guildId);
        setCurrentGuild(current);
      } catch (error) {
        console.error('Failed to fetch guilds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuilds();
  }, [session?.accessToken, guildId]);

  useEffect(() => {
    if (guilds.length > 0) {
      const current = guilds.find((guild: Guild) => guild.id === guildId);
      setCurrentGuild(current || null);
    }
  }, [guildId, guilds]);

  const handleGuildSelect = async (selectedGuild: Guild) => {
    const userId = session?.user?.id;
    if (!userId) return;
    try {
      const isDJ = await checkIfUserIsDJ(selectedGuild.id, userId);
      if (!isDJ) {
        toast.error('You are not a DJ in this server');
        return;
      }
      setCurrentGuild(selectedGuild);
      setShowGuildDropdown(false);
      router.push(`/guild/${selectedGuild.id}`);
    } catch (error) {
      console.error('Failed to switch guild:', error);
      toast.error('Failed to switch server');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.guild-selector')) {
        setShowGuildDropdown(false);
      }
    };
    if (showGuildDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGuildDropdown]);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#121212] p-6 flex flex-col gap-3 transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute top-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-1.5 rounded-full transition-colors border border-zinc-700 ${isCollapsed ? '-right-6' : '-right-5'}`}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      {/* Guild Selector */}
      {!isCollapsed && (
        <div className="relative guild-selector">
          <button
            onClick={() => {
              if (session?.accessToken) setShowGuildDropdown(!showGuildDropdown);
            }}
            className="w-full flex items-center justify-between p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
            disabled={!session?.accessToken}
          >
            <div className="flex items-center gap-2 min-w-0">
              {currentGuild?.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png`}
                  alt={currentGuild.name}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">{currentGuild?.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <span className="truncate text-sm font-medium">
                {session?.accessToken ? (currentGuild?.name || 'Select a guild') : 'Select a guild'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showGuildDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showGuildDropdown && session?.accessToken && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-2 text-center text-zinc-400 text-sm">Loading servers...</div>
              ) : (
                <div className="py-1">
                  {guilds.map((guild) => (
                    <button
                      key={guild.id}
                      onClick={() => handleGuildSelect(guild)}
                      className={`w-full flex items-center gap-2 p-2 hover:bg-zinc-700 transition-colors text-left ${
                        guild.id === guildId ? 'bg-zinc-700' : ''
                      }`}
                    >
                      {guild.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                          alt={guild.name}
                          className="w-5 h-5 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">{guild.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="truncate text-sm">{guild.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {!isCollapsed && <hr className="border-zinc-800" />}
      {guildId && (
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
          pathname === `/guild/${guildId}` ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}>
          <div className="w-6 h-6 flex-shrink-0">
            <Home className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <Link href={`/guild/${guildId}`} className="hover:text-white transition-colors">
              <span>Home</span>
            </Link>
          )}
        </div>
      )}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
        pathname === '/guilds' ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}>
        <div className="w-6 h-6 flex-shrink-0">
          <Server className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <Link href="/guilds" className="hover:text-white transition-colors">
            <span>Server</span>
          </Link>
        )}
      </div>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
        (guildId && pathname === `/guild/${guildId}/explore`) || (!guildId && pathname === '/explore') ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}>
        <div className="w-6 h-6 flex-shrink-0">
          <Compass className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <Link href={guildId ? `/guild/${guildId}/explore` : '/explore'} className="hover:text-white transition-colors">
            <span>Explore</span>
          </Link>
        )}
      </div>
      {guildId && (
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
          pathname === `/guild/${guildId}/search` ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}>
          <div className="w-6 h-6 flex-shrink-0">
            <Search className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <button 
              onClick={onOpenSpotlight} 
              className="hover:text-white transition-colors text-left"
            >
              <span>Search</span>
            </button>
          )}
        </div>
      )}
      {!isCollapsed && <hr className="border-zinc-800" />}
      {!isCollapsed && (
        <div className="mt-1">
          <button className="w-full bg-zinc-800 text-white px-3 py-2 rounded-2xl hover:bg-zinc-700 transition-colors text-sm font-medium mb-4 flex items-center gap-2">
            <ListMusic className="w-4 h-4" />
            Create Playlist
          </button>
          <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Your Playlists</h2>
          <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {playlists.map((playlist) => (
              <li key={playlist.id} className="text-zinc-400 hover:text-white transition-colors cursor-pointer truncate">
                {guildId && (
                  <Link href={`/guild/${guildId}/playlist/${playlist.id}`} className="flex items-center gap-2">
                    <ListMusic className="w-4 h-4" />
                    <span>{playlist.name}</span>
                    <span className="text-xs text-zinc-600">({playlist.trackCount})</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!isCollapsed && guildId && (
        <div className="mt-auto">
          <Link
            href={`/guild/${guildId}/settings`}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium select-none bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm
              ${pathname === `/guild/${guildId}/settings` ? 'text-white' : 'text-zinc-300'}
            `}
            style={{ background: 'none' }}
          >
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 