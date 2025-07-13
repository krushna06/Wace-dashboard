'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/AppLayout';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';
import { musicApi, spotifyApi, TrendingTrack } from '@/services/api';
import { Play, TrendingUp } from 'lucide-react';

export default function ExplorePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { isOpen, closeSpotlight, openSpotlight } = useSpotlightSearch();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingSongs();
  }, []);

  const fetchTrendingSongs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tracks = await spotifyApi.getTrendingSongs();
      setTrendingTracks(tracks);
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch trending songs');
      setTrendingTracks(getMockTrendingSongs());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockTrendingSongs = (): TrendingTrack[] => {
    return [];
  };

  const handlePlayTrack = async (track: TrendingTrack) => {
    if (!session?.user?.id) {
      console.error('User ID is missing. Cannot play track.');
      return;
    }
    try {
      await musicApi.playTrack(params.id, session.user.id, `${track.title} ${track.artist}`);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <>
      <SpotlightSearch 
        guildId={params.id} 
        isOpen={isOpen} 
        onClose={closeSpotlight} 
      />
      <AppLayout guildId={params.id} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-3xl font-bold">Explore</h1>
                <p className="text-zinc-400">Discover trending music from around the world</p>
              </div>
            </div>

            {/* Trending Songs Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : error ? (
              <div className="text-center text-zinc-400 py-8">
                <p>Failed to load trending songs</p>
                <button 
                  onClick={fetchTrendingSongs}
                  className="mt-4 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {trendingTracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    className="group bg-zinc-900/50 rounded-lg p-4 hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {/* Album Art */}
                    <div className="relative mb-4">
                                             <img 
                         src={track.image} 
                         alt={track.title}
                         className="w-full aspect-square object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                         onError={(e) => {
                           console.log('Image failed to load:', track.image);
                           e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
                         }}
                       />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                        <div className="bg-white text-black rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>

                    </div>
                    
                    {/* Track Info */}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-zinc-400 text-sm truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Refresh Button */}
            {!isLoading && !error && (
              <div className="mt-8 text-center">
                <button 
                  onClick={fetchTrendingSongs}
                  className="bg-zinc-800 text-white px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Refresh Trending
                </button>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
} 