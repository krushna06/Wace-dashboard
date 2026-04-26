import { Search } from 'lucide-react';
import React from 'react';

interface SearchBarProps {
  pathname: string;
  guildSearchQuery: string;
  setGuildSearchQuery: (value: string) => void;
  guildSearchInputRef: React.RefObject<HTMLInputElement>;
  onOpenSpotlight: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ pathname, guildSearchQuery, setGuildSearchQuery, guildSearchInputRef, onOpenSpotlight }) => {
  return (
    <div className="flex items-center max-w-4xl w-full">
      {pathname === '/guilds' || pathname === '/admin' ? (
        pathname === '/guilds' ? (
          <input
            ref={guildSearchInputRef}
            type="text"
            value={guildSearchQuery}
            onChange={e => setGuildSearchQuery(e.target.value)}
            placeholder="Search for a server..."
            className="w-full bg-zinc-800 text-zinc-400 placeholder-zinc-400 px-4 py-1.5 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-zinc-700 hover:bg-zinc-700 transition-colors text-sm"
          />
        ) : null
      ) : (
        <button
          onClick={onOpenSpotlight}
          className="w-full bg-zinc-800 text-zinc-400 placeholder-zinc-400 px-4 py-1.5 rounded-lg text-left hover:bg-zinc-700 transition-colors flex items-center gap-3"
        >
          <Search className="w-4 h-4 text-zinc-400" />
          <span className="text-sm">Search for music...</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar; 