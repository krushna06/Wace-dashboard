'use client'

import React, { useState, useEffect } from 'react';
import { Search, Home, Volume2, Maximize2, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { musicApi, type PlayerState, type Track, type Playlist } from '@/services/api';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

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
  const [showVolumeNotification, setShowVolumeNotification] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const router = useRouter();
  const params = useParams();

  // ... existing code for fetchPlayerState, fetchPlaylists, fetchPlaylist, useEffect, handleTrackAdded, handlePlayPause, handleSkip, handlePrevious, handleVolumeChange, handleSeek, handleSearch, and handleShuffle functions ...

  const filteredMainQueue = playerState?.queue?.filter(track => track.requesterId === REQUESTER_ID);

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar playlists={playlists} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage playerState={playerState} filteredMainQueue={filteredMainQueue} />} />
          <Route path="/search" element={
            <SearchPage
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchSource={searchSource}
              setSearchSource={setSearchSource}
              searchResults={searchResults}
              isSearching={isSearching}
            />
          } />
          <Route path="/playlist/:id" element={<PlaylistPageWrapper />} />
        </Routes>
        <PlayerControls
          playerState={playerState}
          handlePlayPause={handlePlayPause}
          handleSkip={handleSkip}
          handlePrevious={handlePrevious}
          handleSeek={handleSeek}
          currentTime={currentTime}
          volume={volume}
          handleVolumeChange={handleVolumeChange}
          isShuffled={isShuffled}
          handleShuffle={handleShuffle}
        />
      </main>
      {showVolumeNotification && <VolumeNotification volume={volume} />}
    </div>
  );
} 