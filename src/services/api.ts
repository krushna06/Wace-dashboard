import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL as string,
  headers: {
    'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
  },
});

async function getAdminHeaders(userId: string) {
  try {
    const rolesRes = await api.get(`/v1/support-server-roles/${userId}`, {
      headers: {
        'x-user-id': userId,
        'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
      },
    });
    
    const roleIds = rolesRes.data?.roles || [];
    const rolesHeader = roleIds.join(',');
    
    return {
      'x-user-id': userId,
      'x-user-roles': rolesHeader,
      'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
    };
  } catch (error) {
    return {
      'x-user-id': userId,
      'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
    };
  }
}

export interface Track {
  title: string;
  uri: string;
  length: number;
  thumbnail: string;
  author: string;
  requester: {
    id: string;
    username: string;
    globalName: string;
    defaultAvatarURL: string;
  } | null;
}

export interface PlayerState {
  guildId: string;
  loop: 'none' | 'track' | 'queue';
  pause: boolean;
  member: string;
  position: number;
  current: Track | null;
  queue: Track[];
  volume: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  private: boolean;
  created: number;
  trackCount: number;
  tracks: Track[];
}

export const musicApi = {
  async getVolume(guildId: string): Promise<number> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}/volume`);
      return data.data;
    } catch (error) {
      throw error;
    }
  },
  async getPlayer(guildId: string): Promise<PlayerState> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getCurrentTrack(guildId: string): Promise<Track | null> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}/current`);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueue(guildId: string): Promise<Track[]> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}/queue`);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async togglePlay(guildId: string): Promise<void> {
    try {
      const currentState = await this.getPlayer(guildId);
      await api.patch(`/v1/players/${guildId}`, {
        paused: !currentState.pause,
      });
    } catch (error) {
      throw error;
    }
  },  

  async setPosition(guildId: string, position: number): Promise<void> {
    try {
      await api.patch(`/v1/players/${guildId}`, {
        position,
      });
    } catch (error) {
      throw error;
    }
  },

  async setLoop(guildId: string, mode: "none" | "track" | "queue" | "song"): Promise<void> {
    const backendMode = mode === 'song' ? 'song' : mode;
    try {
      await api.patch(`/v1/players/${guildId}`, {
        loop: backendMode,
      });
    } catch (error) {
      throw error;
    }
  },

  async skipTrack(guildId: string): Promise<void> {
    try {
      await api.patch(`/v1/players/${guildId}`, {
        skipMode: "skip",
      });
    } catch (error) {
      throw error;
    }
  },

  async previousTrack(guildId: string): Promise<void> {
    try {
      await api.patch(`/v1/players/${guildId}`, {
        skipMode: "previous",
      });
    } catch (error) {
      throw error;
    }
  },

  async setVolume(guildId: string, volume: number): Promise<void> {
    try {
      const volumeValue = Math.min(1000, Math.max(0, volume));
      await api.patch(`/v1/players/${guildId}`, {
        volume: volumeValue,
      });
    } catch (error) {
      throw error;
    }
  },

  async addTrack(guildId: string, url: string): Promise<Track[]> {
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        add: [url],
      });
      return data.added;
    } catch (error) {
      throw error;
    }
  },

  async skipToTrack(guildId: string, position: number): Promise<void> {
    try {
      await api.patch(`/v1/players/${guildId}`, {
        skipTo: position,
      });
    } catch (error) {
      throw error;
    }
  },

  async toggleLoop(guildId: string, mode: "queue" | "song" | "none"): Promise<void> {
    try {
      await api.patch(`/v1/players/${guildId}`, {
        loop: mode,
      });
    } catch (error) {
      throw error;
    }
  },

  async search(query: string, requesterId: string, source: 'youtube' | 'spotify' = 'youtube'): Promise<Track[]> {
    try {
      const { data } = await api.get(`/v1/search`, {
        params: {
          identifier: query,
          requester: requesterId,
          source: source
        }
      });
      return data.tracks || [];
    } catch (error) {
      throw error;
    }
  },

  async getPlaylists(requesterId: string): Promise<Playlist[]> {
    try {
      const { data } = await api.get(`/v1/playlists/${requesterId}`);
      return data.data || [];
    } catch (error) {
      throw error;
    }
  },

  async getPlaylist(id: string, requesterId: string): Promise<Playlist> {
    try {
      const playlists = await this.getPlaylists(requesterId);
      
      const playlist = playlists.find(p => p.id === id);
      
      if (playlist) {
        return {
          ...playlist,
          tracks: Array.isArray(playlist.tracks) ? playlist.tracks : []
        };
      }
      
      throw new Error('Playlist not found');
    } catch (error) {
      throw error;
    }
  },

  async getShuffleStatus(guildId: string): Promise<boolean> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}/shuffle`);
      return data.shuffle;
    } catch (error) {
      throw error;
    }
  },

  async setShuffle(guildId: string, shuffle: boolean): Promise<void> {
    try {
      await api.patch(`/v1/players/${guildId}/shuffle`, { shuffle });
    } catch (error) {
      throw error;
    }
  },

  async playTrack(guildId: string, userId: string, search: string): Promise<void> {
    try {
      await api.post('/v1/players/play', {
        guildId,
        userId,
        search,
      });
    } catch (error) {
      throw error;
    }
  },

  async getAvailableFilters(): Promise<string[]> {
    try {
      const { data } = await api.get('/v1/filters');
      const commandFilters = data.data?.commandFilters?.map((filter: any) => filter.name) || [];
      const wacelinkFilters = data.data?.wacelinkFilters?.map((filter: any) => filter.name) || [];
      
      const allFilters = Array.from(new Set([...commandFilters, ...wacelinkFilters]));
      return allFilters;
    } catch (error) {
      throw error;
    }
  },

  async getCurrentFilter(guildId: string): Promise<{ filter: string; amount?: number } | null> {
    try {
      const { data } = await api.get(`/v1/filters/${guildId}`);
      return data.filter || data.data?.filter || null;
    } catch (error) {
      throw error;
    }
  },

  async applyFilter(guildId: string, filter: string, amount?: number): Promise<void> {
    try {
      const payload: { filter: string; amount?: number } = { filter };
      if (amount !== undefined) {
        payload.amount = amount;
      }
      
      await api.post(`/v1/filters/${guildId}`, payload);
    } catch (error) {
      throw error;
    }
  },

  async clearFilters(guildId: string): Promise<void> {
    try {
      await api.delete(`/v1/filters/${guildId}`);
    } catch (error) {
      throw error;
    }
  },

  async getLanguage(guildId: string, authToken?: string): Promise<{ language: string; available: string[] }> {
    try {
      const headers = authToken ? { Authorization: authToken } : undefined;
      const { data } = await api.get(`/v1/language/${guildId}`, { headers });
      return data;
    } catch (error) {
      throw error;
    }
  },
  async setLanguage(guildId: string, language: string, authToken?: string): Promise<{ success: boolean; language: string }> {
    try {
      const headers = authToken ? { Authorization: authToken } : undefined;
      const { data } = await api.patch(`/v1/language/${guildId}`, { language }, { headers });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async clearQueue(guildId: string): Promise<void> {
    try {
      await api.delete(`/v1/queue/${guildId}`);
    } catch (error) {
      throw error;
    }
  },

  async removeFromQueue(guildId: string, position: number): Promise<void> {
    try {
      await api.delete(`/v1/queue/${guildId}/${position}`);
    } catch (error) {
      throw error;
    }
  },

  async checkUserAndBotInGuild(guildId: string, userId: string): Promise<{ inGuild: boolean; inSameVoice: boolean; userVoiceChannelId?: string; botVoiceChannelId?: string }> {
    try {
      const { data } = await api.get(`/v1/guild-checker/${guildId}/${userId}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async deletePlaylist(playlistId: string, ownerId: string): Promise<void> {
    try {
      await api.delete(`/v1/playlist/${playlistId}`, {
        headers: {
          'x-owner': ownerId,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async editPlaylist(
    playlistId: string,
    ownerId: string,
    data: { name?: string; description?: string; private?: boolean }
  ): Promise<void> {
    try {
      await api.patch(
        `/v1/playlist/${playlistId}`,
        { owner: ownerId, ...data },
        {
          headers: {
            'x-owner': ownerId,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async createPlaylist({ name, description, private: isPrivate, owner }: { name: string; description?: string; private?: boolean; owner: string }): Promise<void> {
    try {
      await api.post(
        '/v1/playlist',
        { name, description, private: isPrivate, owner },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async getLyrics(guildId: string): Promise<any> {
    try {
      const { data } = await api.get(`/v1/lyrics/${guildId}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getUserHistory(userId: string): Promise<any[]> {
    try {
      const { data } = await api.get(`/v1/user-history/${userId}`);
      return data.history || [];
    } catch (error) {
      return [];
    }
  },
};

export interface TrendingTrack {
  id: string;
  title: string;
  artist: string;
  image: string;
  url?: string;
}

export const spotifyApi = {
  async getTrendingSongs(): Promise<TrendingTrack[]> {
    try {
      const response = await fetch(
        'https://itunes.apple.com/us/rss/topsongs/limit=48/json'
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch iTunes trending tracks: ${response.status}`);
      }

      const data = await response.json();

      if (data.feed?.entry) {
        const tracks = data.feed.entry.map((entry: any) => {
          const title = entry['im:name']?.label || 'Unknown';
          const artist = entry['im:artist']?.label || 'Unknown Artist';
          const image = entry['im:image']?.[entry['im:image'].length - 1]?.label || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
          const url = entry.link?.attributes?.href || '';

          return {
            id: entry.id?.attributes?.['im:id'] || `${artist}-${title}`,
            title,
            artist,
            image,
            url
          };
        });

        return tracks;
      } else {
        throw new Error('No trending tracks found');
      }
    } catch (error) {
      throw error;
    }
  }
};

export interface UserStats {
  userId: string;
  songsPlayed: number;
  commandsExecuted: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const { data } = await api.get(`/v1/stats/user/${userId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to load stats');
  }
}

export interface GuildStats {
  guildId: string;
  songsPlayed: number;
  commandsExecuted: number;
}

export async function getGuildStats(guildId: string): Promise<GuildStats> {
  try {
    const { data } = await api.get(`/v1/stats/guild/${guildId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to load guild stats');
  }
}

export async function checkIfUserIsDJ(guildId: string, userId: string): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DJ_ONLY !== 'true') return true;
  if (!guildId || !userId) return false;
  try {
    const response = await api.get(`/v1/dj/${guildId}/userid`, {
      params: { userid: userId },
    });
    return response.data?.data === 1;
  } catch (err) {
    return false;
  }
}

export async function checkIfUserIsPremium(userId: string): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_PREMIUM_ONLY !== 'true') return true;
  if (!userId) return false;
  try {
    const response = await api.get(`/v1/premium/user/${userId}`);
    return response.data?.data?.premium === true;
  } catch (err) {
    return false;
  }
}

export interface TopSong {
  guildId: string;
  songId: string;
  title: string;
  author: string;
  uri: string;
  playCount: number;
}

export interface TopSongsResponse {
  guildId: string;
  topSongs: TopSong[];
}

export async function getGuildTopSongs(guildId: string): Promise<TopSongsResponse> {
  try {
    const { data } = await api.get(`/v1/stats/top-songs/${guildId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to load top songs');
  }
}

export interface TopUser {
  userId: string;
  username: string;
  bot?: boolean;
  guildId: string;
  songsPlayed: number;
  commandsExecuted: number;
}

export interface TopUsersResponse {
  guildId: string;
  topUsers: TopUser[];
}

export async function getGuildTopUsers(guildId: string): Promise<TopUsersResponse> {
  try {
    const { data } = await api.get(`/v1/stats/top-users/${guildId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to load top users');
  }
}

export interface LastPlayedSong {
  guildId: string;
  songId: string;
  title: string;
  author: string;
  uri: string;
  playedAt: number;
}

export interface LastPlayedResponse {
  guildId: string;
  lastPlayed: LastPlayedSong;
}

export async function getGuildLastPlayed(guildId: string): Promise<LastPlayedResponse> {
  try {
    const { data } = await api.get(`/v1/stats/last-played/${guildId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to load last played song');
  }
}

export interface UserTopSongsResponse {
  userId: string;
  topSongs: TopSong[];
}

export async function getUserTopSongs(userId: string): Promise<UserTopSongsResponse> {
  try {
    const { data } = await api.get(`/v1/stats/top-songs-user/${userId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to load user top songs');
  }
}

export interface UserLastPlayedResponse {
  userId: string;
  lastPlayed: LastPlayedSong;
}

export async function getUserLastPlayed(userId: string): Promise<UserLastPlayedResponse> {
  try {
    const { data } = await api.get(`/v1/stats/last-played-user/${userId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to load user last played song');
  }
}

export interface DiscordUserInfo {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
}

export async function getDiscordUserInfo(userId: string): Promise<DiscordUserInfo> {
  try {
    const { data } = await api.get(`/v1/users/${userId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to fetch user info');
  }
}

// ── Admin API ────────────────────────────────────────────────────────────────

export interface AdminMe {
  authorized: boolean;
  role: 'owner' | 'admin';
  userId: string;
}

export interface BlacklistEntry {
  id: string;
  type: 'user' | 'guild';
  reason?: string;
  blacklistedAt?: number;
  blacklistedBy?: string;
}

export interface PremiumKey {
  code: string;
  plan: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';
  createdAt?: string;
}

export interface PremiumUser {
  id: string
  userId?: string
  isPremium?: boolean
  plan?: string
  redeemedBy?: { id?: string; username?: string; globalName?: string }
  redeemedAt?: number
  expiresAt?: string | number | null
  expired?: boolean
}

export const adminApi = {
  async checkAccess(userId: string): Promise<{ isAdmin: boolean; role: 'admin' | 'owner' }> {
    try {
      const rolesRes = await api.get(`/v1/support-server-roles/${userId}`, {
        headers: {
          'x-user-id': userId,
          'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
        },
      });
      
      const roleIds = rolesRes.data?.roles || [];
      const rolesHeader = roleIds.join(',');
      
      const { data } = await api.get('/v1/admin/me', {
        headers: {
          'x-user-id': userId,
          'x-user-roles': rolesHeader,
          'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
        },
      });
      return { isAdmin: data.authorized, role: data.role };
    } catch (error) {
      try {
        const { data } = await api.get(`/v1/admin/check-access/${userId}`, {
          headers: {
            'x-user-id': userId,
            'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
          },
        });
        return data;
      } catch {
        throw error;
      }
    }
  },

  async getMe(userId: string): Promise<AdminMe> {
    try {
      const rolesRes = await api.get(`/v1/support-server-roles/${userId}`, {
        headers: {
          'x-user-id': userId,
          'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
        },
      });
      
      const roleIds = rolesRes.data?.roles || [];
      const rolesHeader = roleIds.join(',');
      
      const { data } = await api.get('/v1/admin/me', { 
        headers: { 
          'x-user-id': userId,
          'x-user-roles': rolesHeader,
          'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
        } 
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getBlacklist(userId: string): Promise<BlacklistEntry[]> {
    const headers = await getAdminHeaders(userId);
    const { data } = await api.get('/v1/admin/blacklist', { headers });
    return data;
  },
  async addBlacklist(userId: string, entry: { id: string; type: 'user' | 'guild'; reason?: string }): Promise<void> {
    const headers = await getAdminHeaders(userId);
    await api.post('/v1/admin/blacklist', entry, { headers });
  },
  async removeBlacklist(userId: string, id: string): Promise<void> {
    const headers = await getAdminHeaders(userId);
    await api.delete(`/v1/admin/blacklist/${id}`, { headers });
  },

  async getKeys(userId: string): Promise<PremiumKey[]> {
    const headers = await getAdminHeaders(userId);
    const { data } = await api.get('/v1/admin/premium/keys', { headers });
    return data;
  },
  async generateKeys(userId: string, plan: PremiumKey['plan'], amount?: number): Promise<PremiumKey[]> {
    const headers = await getAdminHeaders(userId);
    const { data } = await api.post('/v1/admin/premium/keys', { plan, amount }, { headers });
    return data;
  },
  async deleteKey(userId: string, code: string): Promise<void> {
    const headers = await getAdminHeaders(userId);
    await api.delete(`/v1/admin/premium/keys/${code}`, { headers });
  },

  async getPremiumUsers(userId: string): Promise<PremiumUser[]> {
    const headers = await getAdminHeaders(userId);
    const { data } = await api.get('/v1/admin/premium/users', { headers });
    return data;
  },
  async revokePremium(userId: string, targetId: string): Promise<void> {
    const headers = await getAdminHeaders(userId);
    await api.delete(`/v1/admin/premium/users/${targetId}`, { headers });
  },
  async updatePremium(userId: string, targetId: string, body: { plan?: string; expiresAt?: string }): Promise<void> {
    const headers = await getAdminHeaders(userId);
    await api.patch(`/v1/admin/premium/users/${targetId}`, body, { headers });
  },

  async getCommands(userId: string): Promise<AdminCommandCategory[]> {
    const headers = await getAdminHeaders(userId);
    const { data } = await api.get('/v1/admin/commands', { headers });
    return data;
  },
  async setCommandPremium(userId: string, commandKey: string, isPremium: boolean): Promise<void> {
    const headers = await getAdminHeaders(userId);
    await api.patch(`/v1/admin/commands/${commandKey}`, { isPremium }, { headers });
  },
  async resetCommandOverride(userId: string, commandKey: string): Promise<void> {
    const headers = await getAdminHeaders(userId);
    await api.delete(`/v1/admin/commands/${commandKey}/override`, { headers });
  },

  async getGuilds(userId: string): Promise<GuildsResponse> {
    const headers = await getAdminHeaders(userId);
    const { data } = await api.get('/v1/guilds', { headers });
    return data;
  },
};

// ── Admin Commands API ───────────────────────────────────────────────────────

export interface AdminCommand {
  key: string
  name: string
  description: string
  isPremium: boolean
  originalAccessableby?: string
  hasOverride?: boolean
}

export interface AdminCommandCategory {
  category: string
  commands: AdminCommand[]
}

export interface BotStats {
  uptime: number
  guilds: number
  registeredUsers: number
  activeVCs: number
  songsPlayed: number
}

export interface Guild {
  id: string
  name: string
  memberCount: number
  icon: string | null
  owner: string
}

export interface GuildsResponse {
  total: number
  guilds: Guild[]
}

export async function getBotStats(): Promise<BotStats> {
  const { data } = await api.get('/v1/stats/bot')
  return data
}
