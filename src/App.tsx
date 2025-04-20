import React, { useState, useEffect } from 'react';
import { Search, Home, Volume2, Maximize2, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { musicApi, type PlayerState, type Track, type Playlist } from './services/api';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

const GUILD_ID = '877062059966206002';
const REQUESTER_ID = '853620650592567304';

function VolumeNotification({ volume }: { volume: number }) {
  return (
    <div className="fixed top-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
      Volume: {volume}%
    </div>
  );
}

function Sidebar({ playlists }: { playlists: Playlist[] }) {
  return (
    <div className="w-64 bg-zinc-950 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
        <Home className="w-6 h-6" />
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
      </div>
      <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
        <Search className="w-6 h-6" />
        <Link to="/search" className="hover:text-white transition-colors">Search</Link>
      </div>
      
      <div className="mt-6">
        <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Your Playlists</h2>
        <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="text-zinc-400 hover:text-white transition-colors cursor-pointer truncate">
              <Link to={`/playlist/${playlist.id}`} className="flex items-center gap-2">
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

function PlayerControls({ playerState, handlePlayPause, handleSkip, handlePrevious, handleSeek, currentTime, volume, handleVolumeChange, isShuffled, handleShuffle }: any) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
  );
}

function HomePage({ playerState, filteredMainQueue }: { playerState: PlayerState | null, filteredMainQueue: Track[] | undefined }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Queue</h2>
      {filteredMainQueue && filteredMainQueue.length > 0 ? (
        <div className="grid grid-cols-5 gap-4">
          {filteredMainQueue.map((track, index) => (
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
      ) : (
        <div className="text-center text-zinc-400 py-12">
          <p className="text-xl mb-2">Queue is empty</p>
          <p className="text-sm">Search for songs or select a playlist to add music to the queue</p>
        </div>
      )}
    </div>
  );
}

function SearchPage({ searchQuery, setSearchQuery, searchSource, setSearchSource, searchResults, isSearching }: any) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:border-white transition-colors placeholder:text-zinc-400"
            />
          </div>
          <div className="flex items-center">
            <select
              value={searchSource}
              onChange={(e) => setSearchSource(e.target.value as 'youtube' | 'spotify')}
              className="bg-zinc-800 text-white rounded-full border border-zinc-700 focus:border-white transition-colors px-4 py-2 appearance-none cursor-pointer"
            >
              <option value="youtube">YouTube</option>
              <option value="spotify">Spotify</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {searchQuery ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Search Results ({searchSource})</h2>
            {isSearching ? (
              <div className="text-center text-zinc-400">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-5 gap-4">
                {searchResults.map((track: Track, index: number) => (
                  <div key={index} className="bg-zinc-900/50 p-4 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                    <div className="relative mb-4">
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        className="aspect-square object-cover rounded-md"
                      />
                      <button 
                        onClick={() => musicApi.addTrack(GUILD_ID, track.uri)}
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
            ) : (
              <div className="text-center text-zinc-400">No results found</div>
            )}
          </>
        ) : (
          <div className="text-center text-zinc-400">Enter a search query to find music</div>
        )}
      </div>
    </div>
  );
}

function PlaylistPage({ playlist }: { playlist: Playlist | null }) {
  if (!playlist) {
    return <div className="flex-1 overflow-y-auto p-6 text-center text-zinc-400">Loading playlist...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Playlist Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-48 h-48 bg-zinc-800 rounded-lg flex items-center justify-center">
          <ListMusic className="w-16 h-16 text-zinc-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
          <p className="text-zinc-400 mb-4">{playlist.description}</p>
          <p className="text-zinc-500 text-sm">{playlist.trackCount} tracks</p>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-2">
        {playlist.tracks && playlist.tracks.length > 0 ? (
          playlist.tracks.map((track, index) => (
            <div key={`${track.uri}-${index}`} className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{track.title}</h3>
                <p className="text-zinc-400 text-sm truncate">{track.author}</p>
              </div>
              <button 
                onClick={() => musicApi.addTrack(GUILD_ID, track.uri)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black rounded-full p-2"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-zinc-400">No tracks in this playlist</div>
        )}
      </div>
    </div>
  );
}

function PlaylistPageWrapper() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (id) {
        try {
          const playlistData = await musicApi.getPlaylist(id);
          setPlaylist(playlistData);
        } catch (error) {
          console.error('Failed to load playlist:', error);
          setPlaylist(null);
        }
      }
    };
    
    loadPlaylist();
  }, [id]);

  return <PlaylistPage playlist={playlist} />;
}

function App() {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<'youtube' | 'spotify'>('youtube');
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVolumeNotification, setShowVolumeNotification] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const { id: playlistId } = useParams();
  const [isShuffled, setIsShuffled] = useState(false);

  const filteredMainQueue = playerState?.queue.filter(track => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return track.title.toLowerCase().includes(query) || 
           track.author.toLowerCase().includes(query);
  });

  const fetchPlayerState = async () => {
    try {
      const state = await musicApi.getPlayer(GUILD_ID);
      setPlayerState(state);
      setCurrentTime(state.position);
      
      if (state.volume !== undefined) {
        setVolume(state.volume);
      }
    } catch (error) {
      if (!playerState) {
        console.log('No active player or empty queue');
      }
      
      if (!playerState) {
        setPlayerState({
          guildId: GUILD_ID,
          loop: 'none',
          pause: true,
          member: '',
          position: 0,
          current: null,
          queue: [],
          volume: 100
        });
      }
    }
  };

  const fetchPlaylists = async () => {
    try {
      const playlistsData = await musicApi.getPlaylists(REQUESTER_ID);
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const fetchPlaylist = async (id: string) => {
    if (currentPlaylist?.id === id) {
      return;
    }

    try {
      const playlist = await musicApi.getPlaylist(id);
      setCurrentPlaylist(playlist);
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      setCurrentPlaylist(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (playlists.length === 0) {
        await fetchPlaylists();
      }
      
      if (playlistId) {
        await fetchPlaylist(playlistId);
      } else {
        setCurrentPlaylist(null);
      }
    };

    fetchData();
  }, [playlistId]);

  useEffect(() => {
    fetchPlayerState();
    
    let interval: number | null = null;
    
    const startPolling = () => {
      if (playerState?.current || (playerState?.queue && playerState.queue.length > 0)) {
        interval = window.setInterval(fetchPlayerState, 1000);
      }
    };

    const stopPolling = () => {
      if (interval) {
        window.clearInterval(interval);
        interval = null;
      }
    };

    if (playerState?.current || (playerState?.queue && playerState.queue.length > 0)) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [playerState?.current, playerState?.queue]);

  const handleTrackAdded = async () => {
    await fetchPlayerState();
    if (!playerState?.current && (!playerState?.queue || playerState.queue.length === 0)) {
      const interval = window.setInterval(fetchPlayerState, 1000);
      return () => window.clearInterval(interval);
    }
  };

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
      await musicApi.togglePlay(GUILD_ID);
      await fetchPlayerState();
    } catch (error) {
      console.error("Failed to toggle play state:", error);
    }
  };
  
  const handleSkip = async () => {
    try {
      await musicApi.skipTrack(GUILD_ID);
      await fetchPlayerState();
    } catch (error) {
      console.error("Failed to skip track:", error);
    }
  };
  
  const handlePrevious = async () => {
    try {
      await musicApi.previousTrack(GUILD_ID);
      await fetchPlayerState();
    } catch (error) {
      console.error("Failed to go to previous track:", error);
    }
  };
  
  const handleVolumeChange = async (newVolume: number) => {
    try {
      setShowVolumeNotification(true);
      setVolume(newVolume);
      
      const timeoutId = setTimeout(async () => {
        try {
          await musicApi.setVolume(GUILD_ID, newVolume);
        } catch (error) {
          console.error("Failed to change volume:", error);
        }
      }, 100);
      
      setTimeout(() => {
        setShowVolumeNotification(false);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
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

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await musicApi.search(query, REQUESTER_ID, searchSource);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleShuffle = async () => {
    try {
      const newShuffleState = !isShuffled;
      await musicApi.setShuffle(GUILD_ID, newShuffleState);
      setIsShuffled(newShuffleState);
      await fetchPlayerState();
    } catch (error) {
      console.error("Failed to toggle shuffle:", error);
    }
  };

  return (
    <Router>
      <div className="h-screen bg-black text-white flex flex-col">
        {showVolumeNotification && <VolumeNotification volume={volume} />}
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar playlists={playlists} />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
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
          </div>

          {/* Right Sidebar - Current Song Details */}
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
        </div>

        {/* Player Controls */}
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
      </div>
    </Router>
  );
}

export default App;