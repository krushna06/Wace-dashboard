import { Play, SkipForward, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlayerState, Track } from '@/services/api';
import { musicApi } from '@/services/api';

interface NowPlayingProps {
  playerState: PlayerState | null;
  guildId: string;
  hideQueue?: boolean;
  onClose?: () => void;
}

const NowPlaying = ({ playerState, guildId, hideQueue, onClose }: NowPlayingProps) => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      if (!guildId) {
        setQueue([]);
        return;
      }
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

  const handleRemoveFromQueue = async (position: number) => {
    try {
      await musicApi.removeFromQueue(guildId, position);
      setQueue((prev) => prev.filter((_, idx) => idx !== position - 1));
    } catch (error) {
    }
  };

  return (
    <div className="w-80 p-6 pb-28 flex flex-col gap-6 h-full overflow-y-auto" style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <h2 className="uppercase text-xs font-bold tracking-wider" style={{ color: 'var(--color-secondary)' }}>Now Playing</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:opacity-80 transition-opacity"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            title="Close now playing"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
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
      {!hideQueue && (
        <div className="flex-1 overflow-y-auto mt-2 pr-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Queue</h3>
            {queue.length > 0 && (
              <button
                className="px-2 py-1 rounded text-xs hover:text-white transition-colors disabled:opacity-50 ml-2"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
                onClick={handleClearQueue}
                disabled={clearing}
                title="Clear Queue"
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
                <li key={`${track.uri}-${idx}`} className="flex items-center gap-2 p-2 rounded-lg group" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <div className="w-8 h-8 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                    <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-xs truncate">{track.title}</h4>
                    <p className="text-zinc-400 text-[11px] truncate">{track.author}</p>
                  </div>
                  <button
                    className="ml-2 p-1 rounded text-xs bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 transition-all duration-150"
                    title="Remove from queue"
                    onClick={() => handleRemoveFromQueue(idx + 1)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NowPlaying; 