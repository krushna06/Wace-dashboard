'use client'

import { useEffect, useState } from 'react';
import { musicApi, type Track } from '@/services/api';
import { Play } from 'lucide-react';

interface QueueListProps {
  guildId: string;
}

export function QueueList({ guildId }: QueueListProps) {
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const queueData = await musicApi.getQueue(guildId);
        setQueue(queueData);
      } catch (error) {
        console.error('Failed to fetch queue:', error);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [guildId]);

  const handlePlayTrack = async (track: Track, index: number) => {
    try {
      await musicApi.skipToTrack(guildId, index);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <div className="w-80 bg-zinc-950 p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Queue</h2>
      <div className="flex-1 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
        {queue.map((track, index) => (
          <div key={`${track.uri}-${index}`} className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors group">
            <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
              <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{track.title}</h3>
              <p className="text-zinc-400 text-sm truncate">{track.author}</p>
            </div>
            <button 
              onClick={() => handlePlayTrack(track, index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black rounded-full p-2"
            >
              <Play className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 