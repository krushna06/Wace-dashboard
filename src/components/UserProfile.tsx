'use client'

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

export function UserProfile() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User avatar'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
        )}
        <span className="text-white font-medium">{session.user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-lg shadow-lg border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User avatar'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <User className="w-6 h-6 text-zinc-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{session.user.name}</p>
                <p className="text-zinc-400 text-sm truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
} 