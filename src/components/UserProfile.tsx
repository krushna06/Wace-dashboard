'use client'

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { ChevronDown, LogOut } from 'lucide-react';

export function UserProfile() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <img
          src={session.user.image || `https://cdn.discordapp.com/embed/avatars/${Number(session.user.id) % 5}.png`}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium">{session.user.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-lg border border-zinc-800">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <img
                src={session.user.image || `https://cdn.discordapp.com/embed/avatars/${Number(session.user.id) % 5}.png`}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{session.user.name}</p>
                <p className="text-[10px] text-zinc-400 truncate" title={session.user.email || ''}>{session.user.email || ''}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
} 