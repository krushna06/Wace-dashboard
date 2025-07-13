import { Play, SkipForward, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlayerState, Track } from '@/services/api';
import { musicApi } from '@/services/api';

interface NowPlayingProps {
  playerState: PlayerState | null;
  guildId: string;
}

const NowPlaying = ({ playerState, guildId }: NowPlayingProps) => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const queueData = await musicApi.getQueue(guildId);
        setQueue(queueData);
      } catch (error) {
        setQueue([]);
      }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [guildId]);

  const handleClearQueue = async () => {
    setClearing(true);
    try {
      await musicApi.clearQueue(guildId);
      setQueue([]);
    } catch (error) {
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="w-80 bg-[#121212] p-6 flex flex-col gap-6">
      <h2 className="text-zinc-500 uppercase text-sm font-bold mb-2">Now Playing</h2>
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
        </div>
      ) : (
        <div className="text-zinc-500 text-center">No track currently playing</div>
      )}
      <div className="flex-1 overflow-y-auto mt-2 pr-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-zinc-400 text-xs font-semibold">Queue</h3>
          {queue.length > 0 && (
            <button
              className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 ml-2"
              onClick={handleClearQueue}
              disabled={clearing}
              title="Clear Queue"
              style={{ lineHeight: 1 }}
            >
              Clear Queue
            </button>
          )}
        </div>
        {queue.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center">Queue is empty</div>
        ) : (
          <ul className="space-y-2">
            {queue.map((track, idx) => (
              <li key={`${track.uri}-${idx}`} className="flex items-center gap-2 p-2 bg-zinc-900/50 rounded-lg">
                <div className="w-8 h-8 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-xs truncate">{track.title}</h4>
                  <p className="text-zinc-400 text-[11px] truncate">{track.author}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NowPlaying; 