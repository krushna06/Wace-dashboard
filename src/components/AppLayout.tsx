'use client'

import { useEffect, useState } from 'react';
import { musicApi, type PlayerState, type Playlist } from '@/services/api';
import { PlayerControls } from '@/components/PlayerControls';
import { Search, Home, ListMusic, Play, Server, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';

interface AppLayoutProps {
  children: React.ReactNode;
  guildId: string;
  requesterId: string;
  onOpenSpotlight: () => void;
}

function Sidebar({ playlists, guildId, onOpenSpotlight, isCollapsed, onToggle }: { 
  playlists: Playlist[]; 
  guildId: string; 
  onOpenSpotlight: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#121212] p-6 flex flex-col gap-6 transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute top-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-1.5 rounded-full transition-colors border border-zinc-700 ${isCollapsed ? '-right-4' : '-right-3'}`}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-zinc-400 hover:text-white transition-colors`}>
        <div className="w-6 h-6 flex-shrink-0">
          <Home className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <Link href={`/guild/${guildId}`} className="hover:text-white transition-colors">
            <span>Home</span>
          </Link>
        )}
      </div>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-zinc-400 hover:text-white transition-colors`}>
        <div className="w-6 h-6 flex-shrink-0">
          <Server className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <Link href="/guilds" className="hover:text-white transition-colors">
            <span>Server</span>
          </Link>
        )}
      </div>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-zinc-400 hover:text-white transition-colors`}>
        <div className="w-6 h-6 flex-shrink-0">
          <Compass className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <Link href={`/guild/${guildId}/explore`} className="hover:text-white transition-colors">
            <span>Explore</span>
          </Link>
        )}
      </div>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-zinc-400 hover:text-white transition-colors`}>
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
      
      {!isCollapsed && (
        <div className="mt-6">
          <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Your Playlists</h2>
          <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {playlists.map((playlist) => (
              <li key={playlist.id} className="text-zinc-400 hover:text-white transition-colors cursor-pointer truncate">
                <Link href={`/guild/${guildId}/playlist/${playlist.id}`} className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4" />
                  <span>{playlist.name}</span>
                  <span className="text-xs text-zinc-600">({playlist.trackCount})</span>
                </Link>
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
  }, []);

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
            <h1 className="text-xl font-bold ml-4">Wace Dashboard</h1>
            <UserProfile />
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
        <NowPlaying playerState={playerState} />
      </div>
      <PlayerControls 
        playerState={playerState}
        currentTime={currentTime}
        volume={volume}
        onStateChange={fetchPlayerState}
        guildId={guildId}
      />
    </div>
  );
} 