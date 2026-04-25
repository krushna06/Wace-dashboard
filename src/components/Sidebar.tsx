'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

import { ListMusic, Home, Server, Compass, Search, ChevronLeft, ChevronRight, ChevronDown, Settings, Trash2, Pencil, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { musicApi } from '@/services/api';
import { useGuilds } from '@/contexts/GuildContext';

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
  const { mutualGuilds, loading } = useGuilds();
  const [currentGuild, setCurrentGuild] = useState<Guild | null>(null);
  const [showGuildDropdown, setShowGuildDropdown] = useState(false);
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
  const isAdminPage = pathname === '/admin';

  useEffect(() => {
    if (mutualGuilds.length > 0 && guildId) {
      const current = mutualGuilds.find((guild: Guild) => guild.id === guildId);
      setCurrentGuild(current || null);
    }
  }, [guildId, mutualGuilds]);

  const handleGuildSelect = async (selectedGuild: Guild) => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild.id }),
      });

      if (!response.ok) {
        toast.error('Authorization check failed');
        return;
      }

      const result = await response.json();
      if (!result.isDJ) {
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

  const navItem = (active: boolean) => ({
    className: `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${active ? 'text-white' : 'text-[#BCC3D7] hover:text-white'}`,
    style: active ? { background: 'linear-gradient(135deg,rgba(128,90,245,0.25),rgba(205,153,255,0.15))', border: '1px solid rgba(128,90,245,0.3)' } as React.CSSProperties : {} as React.CSSProperties,
  })

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden`}
      style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
    >
      <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-end'} px-3 pt-4 pb-2 flex-shrink-0`}>
        <button
          onClick={onToggle}
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          className="text-[#BCC3D7] hover:text-white p-1.5 rounded-full transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="relative guild-selector px-3 pb-2 flex-shrink-0">
          <button
            onClick={() => { if (session?.accessToken) setShowGuildDropdown(!showGuildDropdown) }}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:opacity-80 transition-opacity text-left"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            disabled={!session?.accessToken}
          >
            <div className="flex items-center gap-2 min-w-0">
              {currentGuild?.icon ? (
                <img src={`https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png`} alt={currentGuild.name} className="w-5 h-5 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">{currentGuild?.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <span className="truncate text-sm font-medium">{currentGuild?.name || (loading ? 'Loading...' : 'Select a guild')}</span>
            </div>
            <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${showGuildDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showGuildDropdown && session?.accessToken && (
            <div className="absolute top-full left-3 right-3 mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              {loading ? (
                <div className="p-2 text-center text-zinc-400 text-sm">Loading servers...</div>
              ) : mutualGuilds.length === 0 ? (
                <div className="p-2 text-center text-zinc-400 text-sm">No mutual servers with bot</div>
              ) : (
                <div className="py-1">
                  {mutualGuilds.map((guild) => (
                    <button key={guild.id} onClick={() => handleGuildSelect(guild)} className={`w-full flex items-center gap-2 p-2 hover:bg-zinc-700 transition-colors text-left ${guild.id === guildId ? 'bg-zinc-700' : ''}`}>
                      {guild.icon ? (
                        <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt={guild.name} className="w-5 h-5 rounded-full flex-shrink-0" />
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

      {!isCollapsed && <hr style={{ borderColor: 'var(--color-border)' }} className="mx-3 flex-shrink-0" />}

      <nav className="flex flex-col gap-1 px-2 py-2 flex-1 overflow-y-auto overflow-x-hidden">
        {guildId && (
          <Link href={`/guild/${guildId}`} {...navItem(pathname === `/guild/${guildId}`)}>
            <Home className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Home</span>}
          </Link>
        )}
        <Link href="/guilds" {...navItem(pathname === '/guilds')}>
          <Server className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Server</span>}
        </Link>
        <Link href={guildId ? `/guild/${guildId}/explore` : '/explore'} {...navItem((guildId ? pathname === `/guild/${guildId}/explore` : pathname === '/explore'))}>
          <Compass className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Explore</span>}
        </Link>
        <Link href={guildId ? `/guild/${guildId}/stats` : '/stats'} {...navItem((guildId ? pathname === `/guild/${guildId}/stats` : pathname === '/stats'))}>
          <BarChart2 className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Stats</span>}
        </Link>
        {guildId && (
          <button onClick={onOpenSpotlight} {...navItem(pathname === `/guild/${guildId}/search`)}>
            <Search className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Search</span>}
          </button>
        )}

        {!isCollapsed && !isGuildsPage && !isAdminPage && (
          <>
            <hr style={{ borderColor: 'var(--color-border)' }} className="my-2" />
            <button
              className="w-full text-white px-3 py-2 rounded-lg hover:opacity-80 transition-opacity text-sm font-medium flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))' }}
              onClick={openCreateModal}
            >
              <ListMusic className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Create Playlist</span>
            </button>
            <p className="text-[#BCC3D7] uppercase text-xs font-bold mt-3 mb-1 px-1 tracking-wider">Your Playlists</p>
            <ul className="space-y-1">
              {playlists.map((playlist) => (
                <li key={playlist.id} className="group flex items-center justify-between text-zinc-400 hover:text-white transition-colors rounded-lg px-1">
                  {guildId && (
                    <Link href={`/guild/${guildId}/playlist/${playlist.id}`} className="flex items-center gap-2 flex-1 min-w-0 py-1">
                      <ListMusic className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-sm">{playlist.name}</span>
                      <span className="text-xs text-zinc-600 flex-shrink-0">({playlist.trackCount})</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button className="p-1 rounded hover:bg-zinc-700" title="Edit" onClick={() => openEditModal(playlist)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-zinc-700" title="Delete" onClick={() => openConfirmDelete(playlist.id)} disabled={deletingId === playlist.id}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {guildId && !isGuildsPage && !isAdminPage && (
        <div className="px-2 pb-3 flex-shrink-0" style={{ paddingBottom: 'calc(0.75rem + 96px)' }}>
          <Link
            href={`/guild/${guildId}/settings`}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-all text-sm font-medium text-[#BCC3D7] hover:text-white`}
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      )}

      {editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`p-6 rounded-xl shadow-2xl w-full max-w-md ${isClosingEdit ? 'animate-spotlight-fade-out' : 'animate-spotlight-fade-in'}`} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-bold mb-4 text-white">Edit Playlist</h2>
            <input className="w-full mb-3 p-2 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#805AF5]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} placeholder="Playlist Name" value={editName} onChange={e => setEditName(e.target.value)} disabled={editLoading} />
            <textarea className="w-full mb-3 p-2 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#805AF5]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} placeholder="Description (optional)" value={editDescription} onChange={e => setEditDescription(e.target.value)} disabled={editLoading} />
            <label className="flex items-center gap-2 mb-4 text-zinc-300"><input type="checkbox" checked={editPrivate} onChange={e => setEditPrivate(e.target.checked)} disabled={editLoading} />Private</label>
            <div className="flex justify-end gap-2">
              <button onClick={closeEditModal} className="px-4 py-2 rounded-lg text-white hover:opacity-80 transition-opacity" style={{ background: 'var(--color-surface)' }} disabled={editLoading}>Cancel</button>
              <button onClick={handleEditPlaylist} className="px-4 py-2 rounded-lg text-white disabled:opacity-50 hover:opacity-80 transition-opacity" style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))' }} disabled={!editName.trim() || editLoading}>{editLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`p-6 rounded-xl shadow-2xl w-full max-w-md ${isClosingCreate ? 'animate-spotlight-fade-out' : 'animate-spotlight-fade-in'}`} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-bold mb-4 text-white">Create Playlist</h2>
            <input className="w-full mb-3 p-2 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#805AF5]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} placeholder="Playlist Name" value={createName} onChange={e => setCreateName(e.target.value)} disabled={createLoading} />
            <textarea className="w-full mb-3 p-2 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#805AF5]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} placeholder="Description (optional)" value={createDescription} onChange={e => setCreateDescription(e.target.value)} disabled={createLoading} />
            <label className="flex items-center gap-2 mb-4 text-zinc-300"><input type="checkbox" checked={createPrivate} onChange={e => setCreatePrivate(e.target.checked)} disabled={createLoading} />Private</label>
            <div className="flex justify-end gap-2">
              <button onClick={closeCreateModal} className="px-4 py-2 rounded-lg text-white hover:opacity-80 transition-opacity" style={{ background: 'var(--color-surface)' }} disabled={createLoading}>Cancel</button>
              <button onClick={handleCreatePlaylist} className="px-4 py-2 rounded-lg text-white disabled:opacity-50 hover:opacity-80 transition-opacity" style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))' }} disabled={!createName.trim() || createLoading}>{createLoading ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`p-6 rounded-xl shadow-2xl w-full max-w-md ${isClosingConfirmDelete ? 'animate-spotlight-fade-out' : 'animate-spotlight-fade-in'}`} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-bold mb-4 text-white">Delete Playlist</h2>
            <p className="mb-6 text-zinc-300">Are you sure you want to delete this playlist? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={closeConfirmDelete} className="px-4 py-2 rounded-lg text-white hover:opacity-80 transition-opacity" style={{ background: 'var(--color-surface)' }} disabled={deletingId === confirmDeleteId}>Cancel</button>
              <button onClick={handleDeletePlaylist} className="px-4 py-2 rounded-lg text-white disabled:opacity-50 hover:opacity-80 transition-opacity" style={{ background: '#c0392b' }} disabled={deletingId === confirmDeleteId}>{deletingId === confirmDeleteId ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar