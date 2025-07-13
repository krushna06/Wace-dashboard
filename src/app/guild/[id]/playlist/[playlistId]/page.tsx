"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { musicApi, type Playlist, type Track } from "@/services/api";
import { AppLayout } from "@/components/AppLayout";
import { SpotlightSearch } from "@/components/SpotlightSearch";
import { useSpotlightSearch } from "@/hooks/useSpotlightSearch";
import { Play, ListMusic } from "lucide-react";

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function PlaylistPage({ params }: { params: { id: string; playlistId: string } }) {
  const { data: session } = useSession();
  const { isOpen, closeSpotlight, openSpotlight } = useSpotlightSearch();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!session?.user?.id) return;
      
      try {
        const data = await musicApi.getPlaylist(params.playlistId, session.user.id);
        setPlaylist(data);
        setError(null);
      } catch (error) {
        setError("Failed to fetch playlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [params.playlistId, session?.user?.id]);

  const handlePlayTrack = async (track: Track) => {
    if (!session?.user?.id) {
      console.error('User ID is missing. Cannot play track.');
      return;
    }
    try {
      await musicApi.playTrack(params.id, session.user.id, track.title);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  if (loading) {
    return (
      <>
        <SpotlightSearch 
          guildId={params.id} 
          isOpen={isOpen} 
          onClose={closeSpotlight} 
        />
        <AppLayout guildId={params.id} requesterId={session?.user?.id || ""} onOpenSpotlight={openSpotlight}>
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        </AppLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SpotlightSearch 
          guildId={params.id} 
          isOpen={isOpen} 
          onClose={closeSpotlight} 
        />
        <AppLayout guildId={params.id} requesterId={session?.user?.id || ""} onOpenSpotlight={openSpotlight}>
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-red-500">{error}</div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <SpotlightSearch 
        guildId={params.id} 
        isOpen={isOpen} 
        onClose={closeSpotlight} 
      />
      <AppLayout guildId={params.id} requesterId={session?.user?.id || ""} onOpenSpotlight={openSpotlight}>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-48 h-48 bg-zinc-800 rounded-lg overflow-hidden">
            {playlist?.tracks && playlist.tracks.length > 0 ? (
              <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                {playlist.tracks.slice(0, 4).map((track, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={track.thumbnail} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
                      }}
                    />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - (playlist.tracks?.length || 0)) }).map((_, index) => (
                  <div key={`empty-${index}`} className="bg-zinc-700 flex items-center justify-center">
                    <ListMusic className="w-8 h-8 text-zinc-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ListMusic className="w-16 h-16 text-zinc-600" />
              </div>
            )}
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
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                  <span className="text-zinc-400 text-sm font-medium">{index + 1}</span>
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{track.title}</h3>
                  <p className="text-zinc-400 text-sm truncate">{track.author}</p>
                </div>
                <span className="text-zinc-400 text-xs w-12 text-right tabular-nums">{formatDuration(track.length)}</span>
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
    </>
  );
} 