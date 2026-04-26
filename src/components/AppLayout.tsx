'use client'

import { useEffect, useState, useRef } from 'react';
import { musicApi, type PlayerState, type Playlist } from '@/services/api';
import { PlayerControls } from '@/components/PlayerControls';
import { Search, Home, ListMusic, Play, Server, Compass, ChevronLeft, ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';
import { Toaster, toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { checkIfUserIsDJ } from '@/services/api';
import Sidebar from '@/components/Sidebar';
import NowPlaying from '@/components/NowPlaying';
import SearchBar from '@/components/SearchBar';
import { usePlayerWebSocket } from '@/hooks/usePlayerWebSocket';

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
  hidePlayerControls?: boolean;
  hideQueue?: boolean;
}

export function AppLayout({ children, guildId, requesterId, onOpenSpotlight, hidePlayerControls, hideQueue }: AppLayoutProps) {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isNowPlayingCollapsed, setIsNowPlayingCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const [guildSearchQuery, setGuildSearchQuery] = useState('');
  const guildSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
        setIsNowPlayingCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
        setIsNowPlayingCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      setPlayerState(null);
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

  const handlePlayerDestroy = () => {
    setPlayerState(null);
    setCurrentTime(0);
  };

  const handlePlayerUpdate = (data: any) => {
    fetchPlayerState();
  };

  const handleTrackEnd = (data: any) => {
    fetchPlayerState();
  };

  const handleTrackStart = (data: any) => {
    fetchPlayerState();
  };

  const handlePlayerPause = () => {
    setPlayerState(prev => prev ? { ...prev, pause: true } : null);
  };

  const handlePlayerResume = () => {
    setPlayerState(prev => prev ? { ...prev, pause: false } : null);
  };

  usePlayerWebSocket(
    guildId,
    handlePlayerDestroy,
    handlePlayerUpdate,
    handleTrackEnd,
    handleTrackStart,
    handlePlayerPause,
    handlePlayerResume
  );

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
    <div className="h-screen text-white flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {isSidebarCollapsed === false && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in-backdrop" onClick={() => setIsSidebarCollapsed(true)} />
      )}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          playlists={playlists} 
          guildId={guildId} 
          onOpenSpotlight={onOpenSpotlight}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex items-center justify-between gap-2 p-4" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="lg:hidden p-2 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              title={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
            >
              {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
            <div className="flex-1 min-w-0">
              <SearchBar
                pathname={pathname}
                guildSearchQuery={guildSearchQuery}
                setGuildSearchQuery={setGuildSearchQuery}
                guildSearchInputRef={guildSearchInputRef}
                onOpenSpotlight={onOpenSpotlight}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsNowPlayingCollapsed(!isNowPlayingCollapsed)}
                className="lg:hidden p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                title={isNowPlayingCollapsed ? 'Open now playing' : 'Close now playing'}
              >
                {isNowPlayingCollapsed ? <ListMusic className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
              <UserProfile />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pb-32">
            {children}
          </div>
        </div>
        {!isNowPlayingCollapsed && (
          <div className="fixed right-0 top-0 bottom-0 z-40 w-80 lg:hidden overflow-y-auto animate-slide-in-right">
            <NowPlaying playerState={playerState} guildId={guildId || ''} hideQueue={hideQueue} onClose={() => setIsNowPlayingCollapsed(true)} />
          </div>
        )}
        <div className="hidden lg:flex">
          <NowPlaying playerState={playerState} guildId={guildId || ''} hideQueue={hideQueue} />
        </div>
      </div>
      {guildId && !hidePlayerControls && (
        <div className="fixed left-0 right-0 bottom-0 z-50 w-full">
          <PlayerControls 
            playerState={playerState}
            currentTime={currentTime}
            volume={volume}
            onStateChange={fetchPlayerState}
            guildId={guildId}
          />
        </div>
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