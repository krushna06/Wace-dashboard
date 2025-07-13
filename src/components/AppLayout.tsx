'use client'

import { useEffect, useState } from 'react';
import { musicApi, type PlayerState, type Playlist } from '@/services/api';
import { PlayerControls } from '@/components/PlayerControls';
import { Search, Home, ListMusic, Play, Server, Compass, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';
import { Toaster, toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { checkIfUserIsDJ } from '@/services/api';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  guildId?: string;
  requesterId: string;
  onOpenSpotlight: () => void;
}

function Sidebar({ playlists, guildId, onOpenSpotlight, isCollapsed, onToggle }: { 
  playlists: Playlist[]; 
  guildId?: string; 
  onOpenSpotlight: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
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
      router.push(`/guild/${selectedGuild.id}`);
      setShowGuildDropdown(false);
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
            onClick={() => setShowGuildDropdown(!showGuildDropdown)}
            className="w-full flex items-center justify-between p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
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
                {currentGuild?.name || 'Loading...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showGuildDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showGuildDropdown && (
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
    </div>
  );
}

function NowPlaying({ playerState }: { playerState: PlayerState | null }) {
  return (
    <div className="w-64 bg-zinc-950 p-6 flex flex-col gap-6">
      <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Now Playing</h2>
      {playerState?.current ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <img 
              src={playerState.current.thumbnail} 
              alt={playerState.current.title}
              className="w-full aspect-square object-cover rounded-md"
            />
            <div className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-xl">
              <Play className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white truncate">{playerState.current.title}</h3>
            <p className="text-zinc-400 text-sm truncate">{playerState.current.author}</p>
          </div>
          {playerState.current.requester && (
            <div className="flex items-center gap-2">
              <img 
                src={playerState.current.requester.defaultAvatarURL} 
                alt={playerState.current.requester.username || playerState.current.requester.globalName || 'User'} 
                className="w-6 h-6 rounded-full"
              />
              <span className="text-zinc-400 text-sm truncate">
                Requested by {playerState.current.requester.globalName || playerState.current.requester.username}
              </span>
            </div>
          )}
          <div className="text-zinc-500 text-xs">
            Duration: {Math.floor(playerState.current.length / 1000 / 60)}:{(playerState.current.length / 1000 % 60).toString().padStart(2, '0')}
          </div>
        </div>
      ) : (
        <div className="text-zinc-500 text-center">No track currently playing</div>
      )}
    </div>
  );
}

export function AppLayout({ children, guildId, requesterId, onOpenSpotlight }: AppLayoutProps) {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const fetchPlayerState = async () => {
    if (!guildId) {
      setPlayerState(null);
      return;
    }
    try {
      const state = await musicApi.getPlayer(guildId);
      setPlayerState(state);
      setCurrentTime(state.position);
      setVolume(state.volume);
    } catch (error) {
      console.error('Failed to fetch player state:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const playlistsData = await musicApi.getPlaylists(requesterId);
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  useEffect(() => {
    fetchPlayerState();
    fetchPlaylists();
    const interval = setInterval(fetchPlayerState, 5000);
    return () => clearInterval(interval);
  }, [guildId]);

  useEffect(() => {
    if (!playerState?.pause && playerState?.current) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= (playerState.current?.length ?? 0)) {
            fetchPlayerState();
            return 0;
          }
          return prev + 1000;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [playerState?.pause, playerState?.current]);

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          playlists={playlists} 
          guildId={guildId} 
          onOpenSpotlight={onOpenSpotlight}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-900">
            <div className="flex-1"></div>
            <div className="flex items-center max-w-4xl w-full">
              {guildId ? (
                <button
                  onClick={onOpenSpotlight}
                  className="w-full bg-zinc-800 text-zinc-400 placeholder-zinc-400 px-4 py-2 rounded-lg text-left hover:bg-zinc-700 transition-colors flex items-center gap-3"
                >
                  <Search className="w-5 h-5 text-zinc-400" />
                  <span>Search for music...</span>
                </button>
              ) : (
                <button
                  onClick={onOpenSpotlight}
                  className="w-full bg-zinc-800 text-zinc-400 placeholder-zinc-400 px-4 py-2 rounded-lg text-left hover:bg-zinc-700 transition-colors flex items-center gap-3"
                >
                  <Search className="w-5 h-5 text-zinc-400" />
                  <span>Search for music (select a server to play)</span>
                </button>
              )}
            </div>
            <div className="flex-1 flex justify-end">
              <UserProfile />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
        <NowPlaying playerState={playerState} />
      </div>
      {guildId && (
        <PlayerControls 
          playerState={playerState}
          currentTime={currentTime}
          volume={volume}
          onStateChange={fetchPlayerState}
          guildId={guildId}
        />
      )}
      <Toaster 
        position="top-center"
        richColors
        closeButton
        duration={3000}
        offset="60px"
        toastOptions={{
          style: {
            background: '#121212',
            color: 'white',
            border: '1px solid #333'
          }
        }}
      />
    </div>
  );
} 