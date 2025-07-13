'use client'

import { useEffect, useState, useRef } from 'react';
import { musicApi, type PlayerState, type Playlist } from '@/services/api';
import { PlayerControls } from '@/components/PlayerControls';
import { Search, Home, ListMusic, Play, Server, Compass, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';
import { Toaster, toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { checkIfUserIsDJ } from '@/services/api';
import Sidebar from '@/components/Sidebar';
import NowPlaying from '@/components/NowPlaying';
import SearchBar from '@/components/SearchBar';

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

export function AppLayout({ children, guildId, requesterId, onOpenSpotlight }: AppLayoutProps) {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const [guildSearchQuery, setGuildSearchQuery] = useState('');
  const guildSearchInputRef = useRef<HTMLInputElement>(null);

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
            <SearchBar
              pathname={pathname}
              guildSearchQuery={guildSearchQuery}
              setGuildSearchQuery={setGuildSearchQuery}
              guildSearchInputRef={guildSearchInputRef}
              onOpenSpotlight={onOpenSpotlight}
            />
            <div className="flex-1 flex justify-end">
              <UserProfile />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
        <NowPlaying playerState={playerState} guildId={guildId || ''} />
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