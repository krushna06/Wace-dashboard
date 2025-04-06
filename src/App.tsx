import React, { useState, useEffect } from 'react';
import { Search, Home, Volume2, Maximize2, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle } from 'lucide-react';
import { musicApi, type PlayerState, type Track } from './services/api';

const GUILD_ID = '877062059966206002';

function App() {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);

  const fetchPlayerState = async () => {
    try {
      const state = await musicApi.getPlayer(GUILD_ID);
      setPlayerState(state);
      setCurrentTime(state.position);
    } catch (error) {
      console.error('Failed to fetch player state:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchPlayerState();
    const interval = setInterval(fetchPlayerState, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (playerState?.current && !playerState.pause) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1000;
          return newTime >= playerState.current!.length ? playerState.current!.length : newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [playerState?.current, playerState?.pause]);

  const handlePlayPause = async () => {
    if (!playerState) return;
    try {
      console.log("Toggling play/pause...");
      await musicApi.togglePlay(GUILD_ID);
      await fetchPlayerState();
    } catch (error) {
      console.error("Failed to toggle play state:", error);
    }
  };
  
  const handleSkip = async () => {
    try {
      console.log("Skipping track...");
      await musicApi.skipTrack(GUILD_ID);
      await fetchPlayerState();
    } catch (error) {
      console.error("Failed to skip track:", error);
    }
  };
  
  const handlePrevious = async () => {
    try {
      console.log("Going to previous track...");
      await musicApi.previousTrack(GUILD_ID);
      await fetchPlayerState();
    } catch (error) {
      console.error("Failed to go to previous track:", error);
    }
  };
  
  const handleVolumeChange = async (newVolume: number) => {
    try {
      console.log(`Changing volume to: ${newVolume}`);
      setVolume(newVolume);
      await musicApi.setVolume(GUILD_ID, newVolume);
    } catch (error) {
      console.error("Failed to change volume:", error);
    }
  };
  

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerState?.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const position = Math.floor(playerState.current.length * percentage);
    
    try {
      setCurrentTime(position);
      await musicApi.setPosition(GUILD_ID, position);
      await fetchPlayerState();
    } catch (error) {
      console.error('Failed to seek:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-zinc-950 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
            <Home className="w-6 h-6" />
            <span>Home</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
            <Search className="w-6 h-6" />
            <span>Search</span>
          </div>
          
          <div className="mt-6">
            <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Queue</h2>
            <ul className="space-y-2">
              {playerState?.queue.map((track, index) => (
                <li key={index} className="text-zinc-400 hover:text-white transition-colors cursor-pointer truncate">
                  {track.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gradient-to-b from-zinc-900 to-black overflow-auto">
          {/* Search Bar */}
          <div className="p-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:border-white transition-colors placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Song Feed */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Queue</h2>
            <div className="grid grid-cols-5 gap-4">
              {playerState?.queue.map((track, index) => (
                <div key={index} className="bg-zinc-900/50 p-4 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                  <div className="relative mb-4">
                    <img 
                      src={track.thumbnail} 
                      alt={track.title}
                      className="aspect-square object-cover rounded-md"
                    />
                    <button 
                      className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-white truncate">{track.title}</h3>
                  <p className="text-zinc-400 text-sm truncate">{track.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-zinc-950 p-6">
          <div className="bg-zinc-900/50 rounded-lg p-6">
            {playerState?.current ? (
              <>
                <img
                  src={playerState.current.thumbnail}
                  alt={playerState.current.title}
                  className="aspect-square object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-bold mb-2 truncate">{playerState.current.title}</h2>
                <p className="text-zinc-400 mb-4 truncate">{playerState.current.author}</p>
                <div className="space-y-2">
                  <p className="text-sm text-zinc-400">Length: {formatTime(playerState.current.length)}</p>
                  <p className="text-sm text-zinc-400">Position: {formatTime(currentTime)}</p>
                  {playerState.current.requester && (
                    <p className="text-sm text-zinc-400">Requested by: {playerState.current.requester.globalName}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="aspect-square bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-zinc-500">Not Playing</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Controls */}
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
              <Shuffle className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" />
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
              <Repeat className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" />
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
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute inset-y-0 left-0 bg-white rounded-full group-hover:bg-green-500 transition-colors"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;