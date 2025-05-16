'use client'

import { SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, Volume2 } from 'lucide-react';
import React from 'react';
import { musicApi, type PlayerState } from '@/services/api';
import { useState } from 'react';

const GUILD_ID = '877062059966206002';

interface PlayerControlsProps {
  playerState: PlayerState | null;
  currentTime: number;
  volume: number;
  isShuffled?: boolean;
  onStateChange: () => void;
}

export function PlayerControls({ playerState, currentTime, volume, isShuffled = false, onStateChange }: PlayerControlsProps) {
  const [showVolumeNotification, setShowVolumeNotification] = useState(false);
  const [localVolume, setLocalVolume] = useState<number>(0);

  React.useEffect(() => {
    async function fetchVolume() {
      try {
        const vol = await musicApi.getVolume(GUILD_ID);
        setLocalVolume(typeof vol === 'number' ? vol : 50);
      } catch {
        setLocalVolume(50);
      }
    }
    fetchVolume();
  }, []);

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
      await musicApi.togglePlay(GUILD_ID);
      onStateChange();
    } catch (error) {
      console.error("Failed to toggle play state:", error);
    }
  };

  const handleSkip = async () => {
    try {
      await musicApi.skipTrack(GUILD_ID);
      onStateChange();
    } catch (error) {
      console.error("Failed to skip track:", error);
    }
  };

  const handlePrevious = async () => {
    try {
      await musicApi.previousTrack(GUILD_ID);
      onStateChange();
    } catch (error) {
      console.error("Failed to go to previous track:", error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    try {
      setLocalVolume(newVolume);
      setShowVolumeNotification(true);
      await musicApi.setVolume(GUILD_ID, newVolume);
      onStateChange();
      setTimeout(() => setShowVolumeNotification(false), 1000);
    } catch (error) {
      console.error("Failed to change volume:", error);
    }
  };

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerState?.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = Math.floor(playerState.current.length * percentage);
    
    try {
      await musicApi.setPosition(GUILD_ID, newTime);
      onStateChange();
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const handleShuffle = async () => {
    try {
      await musicApi.setShuffle(GUILD_ID, !isShuffled);
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
    try {
      await musicApi.setLoop(GUILD_ID, uiToBackendLoop(nextMode));
      onStateChange();
    } catch (error) {
      console.error('Failed to set loop mode:', error);
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
              className={`w-5 h-5 ${isShuffled ? 'text-white' : 'text-zinc-400'} hover:text-white cursor-pointer transition-colors`}
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
          <Volume2 className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" />
          <div className="w-24">
            <div className="relative h-1 bg-zinc-800 rounded-full">
              <input
                type="range"
                min="0"
                max="100"
                value={localVolume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
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
    </div>
  );
} 