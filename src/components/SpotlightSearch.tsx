'use client'

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { musicApi, type Track } from '@/services/api';
import { Play, Copy, Check, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface SpotlightSearchProps {
  guildId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightSearch({ guildId, isOpen, onClose }: SpotlightSearchProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<'youtube' | 'spotify'>('youtube');
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

             switch (e.key) {
         case 'Escape':
           handleClose();
           break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            handlePlayTrack(searchResults[selectedIndex]);
          } else if (searchQuery.trim()) {
            handleSearch();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchQuery, searchResults, selectedIndex, onClose]);

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await musicApi.search(searchQuery, searchSource);
      setSearchResults(results);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayTrack = async (track: Track) => {
    if (!session?.user?.id) {
      console.error('User ID is missing. Cannot play track.');
      return;
    }
    if (!guildId) {
      toast('Please select a server to play music. You can do this from the Server menu in the sidebar.', {
        duration: 4000,
      });
      return;
    }
    try {
      await musicApi.playTrack(guildId, session.user.id, track.title);
      handleClose();
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchSource]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className={`bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col ${
        isClosing ? 'animate-spotlight-fade-out' : 'animate-spotlight-fade-in'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-zinc-700">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for music..."
            className="flex-1 bg-transparent text-white placeholder-zinc-400 focus:outline-none text-lg"
          />
          <select
            value={searchSource}
            onChange={(e) => setSearchSource(e.target.value as 'youtube' | 'spotify')}
            className="bg-zinc-800 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-white"
          >
            <option value="youtube">YouTube</option>
            <option value="spotify">Spotify</option>
          </select>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          {searchQuery ? (
            <>
              {isSearching ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div 
                  ref={resultsRef}
                  className="overflow-y-auto max-h-[calc(70vh-80px)] scrollbar-custom"
                >
                  {searchResults.map((track, index) => (
                    <div 
                      key={`${track.uri}-${index}`} 
                      className={`flex items-center gap-4 p-3 hover:bg-zinc-800/50 transition-colors group cursor-pointer ${
                        index === selectedIndex ? 'bg-zinc-800/50' : ''
                      }`}
                      onClick={() => handlePlayTrack(track)}
                    >
                      <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{track.title}</h3>
                        <p className="text-zinc-400 text-sm truncate">{track.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(track);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white rounded-full p-2 hover:bg-zinc-700"
                          title="Copy source link"
                        >
                          {copiedTrackId === track.uri ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayTrack(track);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black rounded-full p-2"
                          title="Play track"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-400 p-8">No results found</div>
              )}
            </>
          ) : (
            <div className="text-center text-zinc-400 p-8">
              Start typing to search for music...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-700 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to play, Esc to close</span>
            <span>{searchResults.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
} 