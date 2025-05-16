'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { musicApi, type Track } from '@/services/api';
import { Play, Copy, Check } from 'lucide-react';

export default function GuildSearchPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<'youtube' | 'spotify'>('youtube');
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await musicApi.search(searchQuery, searchSource);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayTrack = async (track: Track) => {
    try {
      await musicApi.addTrack(params.id, track.uri);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const handleCopyLink = async (track: Track) => {
    try {
      await navigator.clipboard.writeText(track.uri);
      setCopiedTrackId(track.uri);
      setTimeout(() => setCopiedTrackId(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <AppLayout guildId={params.id} requesterId={session?.user?.id || ''}>
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Search Music</h1>
          
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for music..."
                className="flex-1 bg-zinc-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              <select
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value as 'youtube' | 'spotify')}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="youtube">YouTube</option>
                <option value="spotify">Spotify</option>
              </select>
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {searchQuery ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Search Results ({searchSource})</h2>
              {isSearching ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-custom pr-2">
                  {searchResults.map((track, index) => (
                    <div key={`${track.uri}-${index}`} className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors group">
                      <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{track.title}</h3>
                        <p className="text-zinc-400 text-sm truncate">{track.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopyLink(track)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white rounded-full p-2 hover:bg-zinc-700"
                          title="Copy source link"
                        >
                          {copiedTrackId === track.uri ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                        <button 
                          onClick={() => handlePlayTrack(track)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black rounded-full p-2"
                          title="Play track"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-400">No results found, did you forget to press enter?</div>
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