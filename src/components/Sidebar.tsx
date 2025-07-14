'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { checkIfUserIsDJ } from '@/services/api';
import { ListMusic, Home, Server, Compass, Search, ChevronLeft, ChevronRight, ChevronDown, Settings, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { musicApi } from '@/services/api';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  description?: string;
  private?: boolean;
}

const Sidebar = ({ playlists, guildId, onOpenSpotlight, isCollapsed, onToggle }: { 
  playlists: Playlist[]; 
  guildId?: string; 
  onOpenSpotlight: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [currentGuild, setCurrentGuild] = useState<Guild | null>(null);
  const [showGuildDropdown, setShowGuildDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrivate, setEditPrivate] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPrivate, setCreatePrivate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [isClosingCreate, setIsClosingCreate] = useState(false);
  const [isClosingEdit, setIsClosingEdit] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isClosingConfirmDelete, setIsClosingConfirmDelete] = useState(false);

  const isGuildsPage = pathname === '/guilds';

  useEffect(() => {
    const fetchGuilds = async () => {
      if (!session?.accessToken) return;
      try {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch guilds');
        const data = await response.json();
        setGuilds(data);
        const current = data.find((guild: Guild) => guild.id === guildId);
        setCurrentGuild(current);
      } catch (error) {
        console.error('Failed to fetch guilds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuilds();
  }, [session?.accessToken, guildId]);

  useEffect(() => {
    if (guilds.length > 0) {
      const current = guilds.find((guild: Guild) => guild.id === guildId);
      setCurrentGuild(current || null);
    }
  }, [guildId, guilds]);

  const handleGuildSelect = async (selectedGuild: Guild) => {
    const userId = session?.user?.id;
    if (!userId) return;
    try {
      const isDJ = await checkIfUserIsDJ(selectedGuild.id, userId);
      if (!isDJ) {
        toast.error('You are not a DJ in this server');
        return;
      }
      setCurrentGuild(selectedGuild);
      setShowGuildDropdown(false);
      router.push(`/guild/${selectedGuild.id}`);
    } catch (error) {
      console.error('Failed to switch guild:', error);
      toast.error('Failed to switch server');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.guild-selector')) {
        setShowGuildDropdown(false);
      }
    };
    if (showGuildDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGuildDropdown]);

  const openConfirmDelete = (playlistId: string) => {
    setConfirmDeleteId(playlistId);
    setIsClosingConfirmDelete(false);
  };

  const closeConfirmDelete = () => {
    setIsClosingConfirmDelete(true);
    setTimeout(() => {
      setConfirmDeleteId(null);
      setIsClosingConfirmDelete(false);
    }, 200);
  };

  const handleDeletePlaylist = async () => {
    if (!session?.user?.id || !confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await musicApi.deletePlaylist(confirmDeleteId, session.user.id);
      toast.success('Playlist deleted');
      closeConfirmDelete();
      router.refresh();
    } catch (err) {
      toast.error('Failed to delete playlist');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setEditName(playlist.name);
    setEditDescription(playlist.description || '');
    setEditPrivate(playlist.private || false);
    setIsClosingEdit(false);
  };

  const closeEditModal = () => {
    setIsClosingEdit(true);
    setTimeout(() => {
      setEditingPlaylist(null);
      setEditName('');
      setEditDescription('');
      setEditPrivate(false);
      setEditLoading(false);
      setIsClosingEdit(false);
    }, 200);
  };

  const handleEditPlaylist = async () => {
    if (!editingPlaylist || !session?.user?.id) return;
    setEditLoading(true);
    try {
      await musicApi.editPlaylist(editingPlaylist.id, session.user.id, {
        name: editName,
        description: editDescription,
        private: editPrivate,
      });
      toast.success('Playlist updated');
      closeEditModal();
      router.refresh();
    } catch (err) {
      toast.error('Failed to update playlist');
    } finally {
      setEditLoading(false);
    }
  };

  const openCreateModal = () => {
    setCreateName('');
    setCreateDescription('');
    setCreatePrivate(false);
    setShowCreateModal(true);
    setIsClosingCreate(false);
  };

  const closeCreateModal = () => {
    setIsClosingCreate(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setCreateName('');
      setCreateDescription('');
      setCreatePrivate(false);
      setCreateLoading(false);
      setIsClosingCreate(false);
    }, 200);
  };

  const handleCreatePlaylist = async () => {
    if (!session?.user?.id) return;
    setCreateLoading(true);
    try {
      await musicApi.createPlaylist({
        name: createName,
        description: createDescription,
        private: createPrivate,
        owner: session.user.id,
      });
      toast.success('Playlist created');
      closeCreateModal();
      router.refresh();
    } catch (err) {
      toast.error('Failed to create playlist');
      setCreateLoading(false);
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#121212] p-6 flex flex-col gap-3 transition-all duration-300 relative pb-32`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute top-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-1.5 rounded-full transition-colors border border-zinc-700 ${isCollapsed ? '-right-6' : '-right-5'}`}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      {/* Guild Selector */}
      {!isCollapsed && (
        <div className="relative guild-selector">
          <button
            onClick={() => {
              if (session?.accessToken) setShowGuildDropdown(!showGuildDropdown);
            }}
            className="w-full flex items-center justify-between p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
            disabled={!session?.accessToken}
          >
            <div className="flex items-center gap-2 min-w-0">
              {currentGuild?.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png`}
                  alt={currentGuild.name}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">{currentGuild?.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <span className="truncate text-sm font-medium">
                {session?.accessToken ? (currentGuild?.name || 'Select a guild') : 'Select a guild'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showGuildDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showGuildDropdown && session?.accessToken && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-2 text-center text-zinc-400 text-sm">Loading servers...</div>
              ) : (
                <div className="py-1">
                  {guilds.map((guild) => (
                    <button
                      key={guild.id}
                      onClick={() => handleGuildSelect(guild)}
                      className={`w-full flex items-center gap-2 p-2 hover:bg-zinc-700 transition-colors text-left ${
                        guild.id === guildId ? 'bg-zinc-700' : ''
                      }`}
                    >
                      {guild.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                          alt={guild.name}
                          className="w-5 h-5 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">{guild.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="truncate text-sm">{guild.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {!isCollapsed && <hr className="border-zinc-800" />}
      {guildId && (
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
          pathname === `/guild/${guildId}` ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}>
          <div className="w-6 h-6 flex-shrink-0">
            <Home className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <Link href={`/guild/${guildId}`} className="hover:text-white transition-colors">
              <span>Home</span>
            </Link>
          )}
        </div>
      )}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
        pathname === '/guilds' ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}>
        <div className="w-6 h-6 flex-shrink-0">
          <Server className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <Link href="/guilds" className="hover:text-white transition-colors">
            <span>Server</span>
          </Link>
        )}
      </div>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
        (guildId && pathname === `/guild/${guildId}/explore`) || (!guildId && pathname === '/explore') ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}>
        <div className="w-6 h-6 flex-shrink-0">
          <Compass className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <Link href={guildId ? `/guild/${guildId}/explore` : '/explore'} className="hover:text-white transition-colors">
            <span>Explore</span>
          </Link>
        )}
      </div>
      {guildId && (
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-colors px-3 py-2 rounded-lg ${
          pathname === `/guild/${guildId}/search` ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}>
          <div className="w-6 h-6 flex-shrink-0">
            <Search className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <button 
              onClick={onOpenSpotlight} 
              className="hover:text-white transition-colors text-left"
            >
              <span>Search</span>
            </button>
          )}
        </div>
      )}
      {!isCollapsed && <hr className="border-zinc-800" />}
      {!isCollapsed && !isGuildsPage && (
        <div className="mt-1">
          <button className="w-full bg-zinc-800 text-white px-3 py-2 rounded-2xl hover:bg-zinc-700 transition-colors text-sm font-medium mb-4 flex items-center gap-2" onClick={openCreateModal}>
            <ListMusic className="w-4 h-4" />
            Create Playlist
          </button>
          <h2 className="text-zinc-500 uppercase text-sm font-bold mb-4">Your Playlists</h2>
          <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {playlists.map((playlist) => (
              <li key={playlist.id} className="text-zinc-400 hover:text-white transition-colors cursor-pointer truncate group flex items-center justify-between">
                {guildId && (
                  <Link href={`/guild/${guildId}/playlist/${playlist.id}`} className="flex items-center gap-2 flex-1 min-w-0">
                    <ListMusic className="w-4 h-4" />
                    <span className="truncate">{playlist.name}</span>
                    <span className="text-xs text-zinc-600">({playlist.trackCount})</span>
                  </Link>
                )}
                <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1 hover:bg-zinc-700 rounded"
                    title="Edit Playlist"
                    onClick={() => openEditModal(playlist)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-zinc-700 rounded"
                    title="Delete Playlist"
                    onClick={() => openConfirmDelete(playlist.id)}
                    disabled={deletingId === playlist.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!isCollapsed && guildId && !isGuildsPage && (
        <div className="mt-auto">
          <Link
            href={`/guild/${guildId}/settings`}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium select-none bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm
              ${pathname === `/guild/${guildId}/settings` ? 'text-white' : 'text-zinc-300'}
            `}
            style={{ background: 'none' }}
          >
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      )}
      {/* Edit Playlist Modal */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-md border border-zinc-700 ${isClosingEdit ? 'animate-spotlight-fade-out' : 'animate-spotlight-fade-in'}` }>
            <h2 className="text-xl font-bold mb-4 text-white">Edit Playlist</h2>
            <input
              className="w-full mb-3 p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
              placeholder="Playlist Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              disabled={editLoading}
            />
            <textarea
              className="w-full mb-3 p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
              placeholder="Description (optional)"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              disabled={editLoading}
            />
            <label className="flex items-center gap-2 mb-4 text-zinc-300">
              <input
                type="checkbox"
                checked={editPrivate}
                onChange={e => setEditPrivate(e.target.checked)}
                disabled={editLoading}
              />
              Private
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={closeEditModal} className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600" disabled={editLoading}>Cancel</button>
              <button
                onClick={handleEditPlaylist}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                disabled={!editName.trim() || editLoading}
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-md border border-zinc-700 ${isClosingCreate ? 'animate-spotlight-fade-out' : 'animate-spotlight-fade-in'}` }>
            <h2 className="text-xl font-bold mb-4 text-white">Create Playlist</h2>
            <input
              className="w-full mb-3 p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
              placeholder="Playlist Name"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              disabled={createLoading}
            />
            <textarea
              className="w-full mb-3 p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
              placeholder="Description (optional)"
              value={createDescription}
              onChange={e => setCreateDescription(e.target.value)}
              disabled={createLoading}
            />
            <label className="flex items-center gap-2 mb-4 text-zinc-300">
              <input
                type="checkbox"
                checked={createPrivate}
                onChange={e => setCreatePrivate(e.target.checked)}
                disabled={createLoading}
              />
              Private
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={closeCreateModal} className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600" disabled={createLoading}>Cancel</button>
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                disabled={!createName.trim() || createLoading}
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-md border border-zinc-700 ${isClosingConfirmDelete ? 'animate-spotlight-fade-out' : 'animate-spotlight-fade-in'}` }>
            <h2 className="text-xl font-bold mb-4 text-white">Delete Playlist</h2>
            <p className="mb-6 text-zinc-300">Are you sure you want to delete this playlist? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={closeConfirmDelete} className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600" disabled={deletingId === confirmDeleteId}>Cancel</button>
              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                disabled={deletingId === confirmDeleteId}
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 