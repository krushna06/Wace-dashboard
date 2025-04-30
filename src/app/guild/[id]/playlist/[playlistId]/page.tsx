'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { musicApi, type Track } from '@/services/api';
import { Play } from 'lucide-react';

export default function PlaylistPage({ params }: { params: { id: string; playlistId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const playlistData = await musicApi.getPlaylist(params.playlistId);
        setPlaylist(playlistData);
        setTracks(playlistData.tracks || []);
      } catch (error) {
        console.error('Failed to fetch playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [params.playlistId]);

  if (!session) {
    router.push('/');
    return null;
  }

  const handlePlayTrack = async (track: Track) => {
    try {
      await musicApi.addTrack(params.id, track.uri);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <AppLayout guildId={params.id} requesterId={session.user?.id || ''}>
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-none p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              {playlist?.thumbnail ? (
                <img
                  src={playlist.thumbnail}
                  alt={playlist.name}
                  className="w-16 h-16 rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <span className="text-2xl font-bold">{playlist?.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{playlist?.name || 'Loading...'}</h1>
                <p className="text-zinc-400">{tracks.length} tracks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 pt-0 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full">
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Tracks</h2>
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : tracks.length > 0 ? (
                <div className="flex-1 overflow-y-auto scrollbar-custom pr-2">
                  <div className="space-y-2">
                    {tracks.map((track, index) => (
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
                          title="Play track"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-400 py-8">
                  No tracks in this playlist
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 