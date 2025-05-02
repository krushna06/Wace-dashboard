'use client'

import { useState, useEffect } from 'react';
import { musicApi, type Track } from '@/services/api';
import { AppLayout } from '@/components/AppLayout';
import { Play } from 'lucide-react';
import { useSession } from 'next-auth/react';

const GUILD_ID = '877062059966206002';

export default function SearchPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<'youtube' | 'spotify'>('youtube');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await musicApi.search(query, session?.user?.id || '', searchSource);
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

  const handlePlayTrack = async (track: Track) => {
    try {
      await musicApi.addTrack(GUILD_ID, track.uri);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <AppLayout guildId={GUILD_ID} requesterId={session?.user?.id || ''}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-full pl-4 pr-4 py-2 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:border-white transition-colors placeholder:text-zinc-400"
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
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((track, index) => (
                    <div key={`${track.uri}-${index}`} className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors group">
                      <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{track.title}</h3>
                        <p className="text-zinc-400 text-sm truncate">{track.author}</p>
                      </div>
                      <button 
                        onClick={() => handlePlayTrack(track)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black rounded-full p-2"
                      >
                        <Play className="w-5 h-5" />
                      </button>
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
    </AppLayout>
  );
} 