import { Play } from 'lucide-react';
import type { PlayerState } from '@/services/api';

const NowPlaying = ({ playerState }: { playerState: PlayerState | null }) => {
  return (
    <div className="w-64 bg-[#121212] p-6 flex flex-col gap-6">
      <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Now Playing</h2>
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
          {playerState.current.requester && (
            <div className="flex items-center gap-2">
              <img 
                src={playerState.current.requester.defaultAvatarURL} 
                alt={playerState.current.requester.username || playerState.current.requester.globalName || 'User'} 
                className="w-6 h-6 rounded-full"
              />
              <span className="text-zinc-400 text-sm truncate">
                Requested by {playerState.current.requester.globalName || playerState.current.requester.username}
              </span>
            </div>
          )}
          <div className="text-zinc-500 text-xs">
            Duration: {Math.floor(playerState.current.length / 1000 / 60)}:{(playerState.current.length / 1000 % 60).toString().padStart(2, '0')}
          </div>
        </div>
      ) : (
        <div className="text-zinc-500 text-center">No track currently playing</div>
      )}
    </div>
  );
};

export default NowPlaying; 