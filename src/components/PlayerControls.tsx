'use client'

import { SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, Volume2, VolumeX, Filter, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { musicApi, type PlayerState } from '@/services/api';

interface PlayerControlsProps {
  playerState: PlayerState | null;
  currentTime: number;
  volume: number;
  isShuffled?: boolean;
  onStateChange: () => void;
  guildId: string;
}

export function PlayerControls({ playerState, currentTime, volume, isShuffled = false, onStateChange, guildId }: PlayerControlsProps) {
  const [showVolumeNotification, setShowVolumeNotification] = useState(false);
  const [localVolume, setLocalVolume] = useState<number>(volume);
  const [showLoopNotification, setShowLoopNotification] = useState(false);
  const [showShuffleNotification, setShowShuffleNotification] = useState(false);
  const [shuffleNotificationText, setShuffleNotificationText] = useState('');
  const [localShuffle, setLocalShuffle] = useState<boolean>(isShuffled);
  const [loopNotificationText, setLoopNotificationText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  
  const [availableFilters, setAvailableFilters] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{ filter: string; amount?: number } | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showFilterNotification, setShowFilterNotification] = useState(false);
  const [filterNotificationText, setFilterNotificationText] = useState('');
  const [bassAmount, setBassAmount] = useState(5);
  const [speedAmount, setSpeedAmount] = useState(5);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const filterDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function fetchVolume() {
      try {
        const vol = await musicApi.getVolume(guildId);
        setLocalVolume(typeof vol === 'number' ? vol : 50);
      } catch {
        setLocalVolume(50);
      }
    }
    fetchVolume();
  }, [guildId]);

  React.useEffect(() => {
    async function fetchFilters() {
      setFiltersLoading(true);
      try {
        const [filters, current] = await Promise.all([
          musicApi.getAvailableFilters(),
          musicApi.getCurrentFilter(guildId)
        ]);
        setAvailableFilters(filters);
        setCurrentFilter(current);
      } catch (error) {
        console.error('Error fetching filters:', error);
        setAvailableFilters(['nightcore', 'bass', 'vaporwave', 'earrape', 'pop', 'electronic', 'party', 'karaoke', '3d', 'china', 'darthvader', 'daycore', 'doubletime', 'pitch', 'rate', 'speed', 'soft', 'tremolo', 'vibrato', 'treblebass']);
      } finally {
        setFiltersLoading(false);
      }
    }
    fetchFilters();
  }, [guildId]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    }

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  function backendToUiLoop(mode: string | undefined): 'song' | 'queue' | 'none' {
    if (mode === 'song') return 'song';
    if (mode === 'queue') return 'queue';
    return 'none';
  }
  function uiToBackendLoop(mode: 'song' | 'queue' | 'none'): 'song' | 'queue' | 'none' {
    if (mode === 'song') return 'song';
    if (mode === 'queue') return 'queue';
    return 'none';
  }
  const [loopMode, setLoopMode] = useState<'song' | 'queue' | 'none'>(backendToUiLoop(playerState?.loop));

  React.useEffect(() => {
    setLoopMode(backendToUiLoop(playerState?.loop));
  }, [playerState?.loop]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (!playerState) return;
    try {
      await musicApi.togglePlay(guildId);
      onStateChange();
    } catch (error) {
      console.error("Failed to toggle play state:", error);
    }
  };

  const handleSkip = async () => {
    try {
      await musicApi.skipTrack(guildId);
      onStateChange();
    } catch (error) {
      console.error("Failed to skip track:", error);
    }
  };

  const handlePrevious = async () => {
    try {
      await musicApi.previousTrack(guildId);
      onStateChange();
    } catch (error) {
      console.error("Failed to go to previous track:", error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    try {
      setLocalVolume(newVolume);
      setShowVolumeNotification(true);
      if (!isDragging) {
        await musicApi.setVolume(guildId, newVolume);
      }
      onStateChange();
      setTimeout(() => setShowVolumeNotification(false), 1000);
    } catch (error) {
      console.error("Failed to change volume:", error);
    }
  };

  const handleVolumeDragEnd = async () => {
    try {
      setIsDragging(false);
      await musicApi.setVolume(guildId, localVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerState?.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = Math.floor(playerState.current.length * percentage);
    
    try {
      await musicApi.setPosition(guildId, newTime);
      onStateChange();
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const handleShuffle = async () => {
    try {
      const newShuffle = !localShuffle;
      await musicApi.setShuffle(guildId, newShuffle);
      setLocalShuffle(newShuffle);
      setShuffleNotificationText(`Shuffle: ${newShuffle ? 'Enabled' : 'Disabled'}`);
      setShowShuffleNotification(true);
      setTimeout(() => setShowShuffleNotification(false), 1000);
      onStateChange();
    } catch (error) {
      console.error("Failed to toggle shuffle:", error);
    }
  };

  const handleLoop = async () => {
    let nextMode: 'song' | 'queue' | 'none';
    if (loopMode === 'none') nextMode = 'song';
    else if (loopMode === 'song') nextMode = 'queue';
    else nextMode = 'none';
    setLoopMode(nextMode);

    let loopText = '';
    if (nextMode === 'song') loopText = 'Loop Type: Song';
    else if (nextMode === 'queue') loopText = 'Loop Type: Queue';
    else loopText = 'Loop Type: Disabled';
    setLoopNotificationText(loopText);
    setShowLoopNotification(true);
    setTimeout(() => setShowLoopNotification(false), 1000);

    try {
      await musicApi.setLoop(guildId, uiToBackendLoop(nextMode));
      onStateChange();
    } catch (error) {
      console.error('Failed to set loop mode:', error);
    }
  };

  const handleMute = () => {
    if (isMuted) {
      setLocalVolume(previousVolume);
      musicApi.setVolume(guildId, previousVolume);
    } else {
      setPreviousVolume(localVolume);
      setLocalVolume(0);
      musicApi.setVolume(guildId, 0);
    }
    setIsMuted(!isMuted);
  };

  const handleApplyFilter = async (filter: string, amount?: number) => {
    try {
      await musicApi.applyFilter(guildId, filter, amount);
      setCurrentFilter({ filter, amount });
      setFilterNotificationText(`Filter applied: ${filter}${amount ? ` (${amount})` : ''}`);
      setShowFilterNotification(true);
      setTimeout(() => setShowFilterNotification(false), 1000);
      setShowFilterDropdown(false);
      onStateChange();
    } catch (error) {
      console.error('Failed to apply filter:', error);
    }
  };

  const handleClearFilters = async () => {
    try {
      await musicApi.clearFilters(guildId);
      setCurrentFilter(null);
      setFilterNotificationText('All filters cleared');
      setShowFilterNotification(true);
      setTimeout(() => setShowFilterNotification(false), 1000);
      setShowFilterDropdown(false);
      onStateChange();
    } catch (error) {
      console.error('Failed to clear filters:', error);
    }
  };

  let loopColor = 'text-zinc-400 hover:text-white';
  if (loopMode === 'song') loopColor = 'text-green-400';
  else if (loopMode === 'queue') loopColor = 'text-pink-400';

  return (
    <div className="h-24 bg-zinc-950 border-t border-zinc-900 p-4">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Currently Playing */}
        <div className="flex items-center gap-4 w-64">
          {playerState?.current ? (
            <>
              <img
                src={playerState.current.thumbnail}
                alt={playerState.current.title}
                className="w-14 h-14 object-cover rounded flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-semibold truncate max-w-[120px]">{playerState.current.title}</h3>
                <p className="text-zinc-400 text-sm truncate max-w-[120px]">{playerState.current.author}</p>
              </div>
            </>
          ) : (
            <div className="w-14 h-14 bg-zinc-800 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-zinc-500 text-xs">No track</span>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          <div className="flex items-center gap-4">
            <Shuffle 
              onClick={handleShuffle}
              className={`w-5 h-5 ${localShuffle ? 'text-green-400' : 'text-zinc-400'} hover:text-white cursor-pointer transition-colors`}
            />
            <SkipBack 
              onClick={handlePrevious}
              className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" 
            />
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition-all"
            >
              {playerState?.pause ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <SkipForward 
              onClick={handleSkip}
              className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" 
            />
            <Repeat 
              onClick={handleLoop}
              className={`w-5 h-5 cursor-pointer transition-colors ${loopColor}`}
            />
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="p-1 transition-colors"
                title={`Audio Filters${currentFilter ? ` - ${currentFilter.filter}${currentFilter.amount ? ` (${currentFilter.amount})` : ''}` : ''}`}
              >
                <Filter 
                  className={`w-5 h-5 ${
                    currentFilter ? 'text-green-400' : 'text-zinc-400'
                  } hover:text-white`}
                />
              </button>
              {showFilterDropdown && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 animate-dropdown-fade-in">
                  <div className="p-2">
                    <div className="text-xs text-zinc-400 mb-2 px-2">Audio Filters</div>
                    {currentFilter && (
                      <div className="mb-2 p-2 bg-zinc-700 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span>Current: {currentFilter.filter}</span>
                          <button
                            onClick={handleClearFilters}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {currentFilter.amount && (
                          <span className="text-zinc-400">Amount: {currentFilter.amount}</span>
                        )}
                      </div>
                    )}
                    <div className="max-h-48 overflow-y-auto scrollbar-custom space-y-1">
                      {filtersLoading ? (
                        <div className="px-2 py-1 text-sm text-zinc-400">Loading filters...</div>
                      ) : availableFilters.length > 0 ? (
                        availableFilters.map((filter) => (
                          <button
                            key={filter}
                            onClick={() => {
                              if (filter === 'bass') {
                                handleApplyFilter(filter, bassAmount);
                              } else if (filter === 'speed') {
                                handleApplyFilter(filter, speedAmount);
                              } else {
                                handleApplyFilter(filter);
                              }
                            }}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-zinc-700 rounded transition-colors"
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </button>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-zinc-400">No filters available</div>
                      )}
                    </div>
                    {availableFilters.includes('bass') && (
                      <div className="mt-2 p-2 border-t border-zinc-700">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                          <span>Bass Amount</span>
                          <span>{bassAmount}</span>
                        </div>
                        <div className="relative h-1 bg-zinc-600 rounded-full">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={bassAmount}
                            onChange={(e) => setBassAmount(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                            className="absolute inset-y-0 left-0 bg-white rounded-full group-hover:bg-green-500 transition-colors"
                            style={{ width: `${(bassAmount / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {availableFilters.includes('speed') && (
                      <div className="mt-2 p-2 border-t border-zinc-700">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                          <span>Speed Amount</span>
                          <span>{speedAmount}</span>
                        </div>
                        <div className="relative h-1 bg-zinc-600 rounded-full">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={speedAmount}
                            onChange={(e) => setSpeedAmount(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                            className="absolute inset-y-0 left-0 bg-white rounded-full group-hover:bg-green-500 transition-colors"
                            style={{ width: `${(speedAmount / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {formatTime(currentTime)}
            </span>
            <div 
              className="flex-1 h-1 bg-zinc-800 rounded-full group cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full group-hover:bg-green-500 transition-colors"
                style={{ 
                  width: playerState?.current 
                    ? `${(currentTime / playerState.current.length) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
            <span className="text-xs text-zinc-400">
              {playerState?.current ? formatTime(playerState.current.length) : '0:00'}
            </span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleMute}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <div className="w-24">
            <div className="relative h-1 bg-zinc-800 rounded-full">
              <input
                type="range"
                min="0"
                max="100"
                value={localVolume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={handleVolumeDragEnd}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={handleVolumeDragEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="absolute inset-y-0 left-0 bg-white rounded-full group-hover:bg-green-500 transition-colors"
                style={{ width: `${localVolume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {showVolumeNotification && (
        <div className="fixed top-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          Volume: {localVolume}%
        </div>
      )}
      {showShuffleNotification && (
        <div className="fixed top-12 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          {shuffleNotificationText}
        </div>
      )}
      {showLoopNotification && (
        <div className="fixed top-20 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          {loopNotificationText}
        </div>
      )}
      {showFilterNotification && (
        <div className="fixed top-28 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          {filterNotificationText}
        </div>
      )}
    </div>
  );
}