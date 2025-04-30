'use client'

import { useEffect, useState } from 'react';
import { musicApi, type Playlist, type Track } from '@/services/api';
import { AppLayout } from '@/components/AppLayout';
import { Play, ListMusic } from 'lucide-react';

const GUILD_ID = '877062059966206002';

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await musicApi.getPlaylist(params.id);
        setPlaylist(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch playlist:', error);
        setError('Failed to fetch playlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [params.id]);

  const handlePlayTrack = async (track: Track) => {
    try {
      await musicApi.addTrack(GUILD_ID, track.uri);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-red-500">{error}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-6 mb-8">
        <div className="w-48 h-48 bg-zinc-800 rounded-lg flex items-center justify-center">
          <ListMusic className="w-16 h-16 text-zinc-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{playlist?.name}</h1>
          <p className="text-zinc-400 mb-4">{playlist?.description}</p>
          <p className="text-zinc-500 text-sm">{playlist?.trackCount} tracks</p>
        </div>
      </div>

      <div className="space-y-2">
        {playlist?.tracks && playlist.tracks.length > 0 ? (
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
                onClick={() => handlePlayTrack(track)}
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
    </AppLayout>
  );
} 