'use client'

import { musicApi, type Track } from '@/services/api';
import { Play, Pause, X } from 'lucide-react';

const GUILD_ID = '877062059966206002';

interface QueueListProps {
  queue: Track[];
  currentTrack: Track | null;
  onStateChange: () => void;
}

export function QueueList({ queue, currentTrack, onStateChange }: QueueListProps) {
  const handleRemoveTrack = async (index: number) => {
    try {
      await musicApi.addTrack(GUILD_ID, `-${index}`);
      onStateChange();
    } catch (error) {
      console.error('Failed to remove track:', error);
    }
  };

  return (
    <div className="space-y-2">
      {currentTrack && (
        <div className="flex items-center gap-3 p-2 bg-zinc-800 rounded">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-10 h-10 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{currentTrack.title}</h3>
            <p className="text-zinc-400 text-sm truncate">{currentTrack.author}</p>
          </div>
          <div className="text-zinc-400 text-sm">
            {Math.floor(currentTrack.length / 1000 / 60)}:
            {(Math.floor(currentTrack.length / 1000) % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}
      {queue.map((track, index) => (
        <div key={index} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded group">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-10 h-10 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{track.title}</h3>
            <p className="text-zinc-400 text-sm truncate">{track.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-zinc-400 text-sm">
              {Math.floor(track.length / 1000 / 60)}:
              {(Math.floor(track.length / 1000) % 60).toString().padStart(2, '0')}
            </div>
            <button
              onClick={() => handleRemoveTrack(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {queue.length === 0 && !currentTrack && (
        <p className="text-zinc-400 text-center py-4">Queue is empty</p>
      )}
    </div>
  );
} 