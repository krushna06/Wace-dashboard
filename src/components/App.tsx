'use client'

import React, { useState, useEffect } from 'react';
import { Search, Home, Volume2, Maximize2, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { musicApi, type PlayerState, type Track, type Playlist } from '@/services/api';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { PlayerControls } from './PlayerControls';

const GUILD_ID = '877062059966206002';
const REQUESTER_ID = '853620650592567304';

// ... existing code for VolumeNotification, Sidebar, PlayerControls, HomePage, SearchPage, and PlaylistPage components ...

export function App() {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSource, setSearchSource] = useState<'youtube' | 'spotify'>('youtube');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const router = useRouter();
  const params = useParams();

  // Fetch player state function for PlayerControls
  const fetchPlayerState = async () => {
    try {
      const state = await musicApi.getPlayer(GUILD_ID);
      setPlayerState(state);
      setCurrentTime(state.position);
      setVolume(state.volume);
    } catch (error) {
      console.error('Failed to fetch player state:', error);
    }
  };

  // ... existing code for fetchPlaylists, fetchPlaylist, useEffect, handleTrackAdded, handleSearch, and handleShuffle functions ...

  const filteredMainQueue = playerState?.queue?.filter(track => track.requester?.id === REQUESTER_ID);

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Page content goes here. In Next.js, this would be handled by the app/page structure. */}
        <PlayerControls
          playerState={playerState}
          currentTime={currentTime}
          volume={volume}
          isShuffled={isShuffled}
          onStateChange={fetchPlayerState}
        />
      </main>
    </div>
  );
} 