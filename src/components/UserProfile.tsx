'use client'

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { ChevronDown, LogOut, Shield } from 'lucide-react';
import { adminApi } from '@/services/api';
import Link from 'next/link';

export function UserProfile() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    adminApi.getMe(session.user.id)
      .then(d => setIsAdmin(d.authorized))
      .catch(() => setIsAdmin(false));
  }, [status, session?.user?.id]);

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
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-purple-400 hover:bg-zinc-800 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
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