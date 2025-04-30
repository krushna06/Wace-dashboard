'use client'

import { useEffect, useState } from 'react';
import { musicApi, type PlayerState, type Playlist } from '@/services/api';
import { PlayerControls } from '@/components/PlayerControls';
import { Search, Home, ListMusic, Play } from 'lucide-react';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
  guildId: string;
  requesterId: string;
}

function Sidebar({ playlists }: { playlists: Playlist[] }) {
  return (
    <div className="w-64 bg-zinc-950 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
        <Home className="w-6 h-6" />
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
      </div>
      <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
        <Search className="w-6 h-6" />
        <Link href="/search" className="hover:text-white transition-colors">Search</Link>
      </div>
      
      <div className="mt-6">
        <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Your Playlists</h2>
        <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="text-zinc-400 hover:text-white transition-colors cursor-pointer truncate">
              <Link href={`/playlist/${playlist.id}`} className="flex items-center gap-2">
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

export function AppLayout({ children, guildId, requesterId }: AppLayoutProps) {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

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
        <Sidebar playlists={playlists} />
        <div className="flex-1 flex flex-col overflow-hidden">
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
      />
    </div>
  );
} 