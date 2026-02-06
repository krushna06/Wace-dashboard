import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL as string,
  headers: {
    'Authorization': process.env.NEXT_PUBLIC_API_AUTH_TOKEN,
  },
});

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
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        paused: !currentState.pause,
      });
      console.log("Play/Pause toggled:", data);
    } catch (error) {
      console.error("Error toggling play state:", error);
      throw error;
    }
  },  

  async setPosition(guildId: string, position: number): Promise<void> {
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        position,
      });
      console.log("Position updated:", data);
    } catch (error) {
      console.error("Error setting position:", error);
      throw error;
    }
  },

  async setLoop(guildId: string, mode: "none" | "track" | "queue" | "song"): Promise<void> {
    const backendMode = mode === 'song' ? 'song' : mode;
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        loop: backendMode,
      });
      console.log("Loop mode updated:", data);
    } catch (error) {
      console.error("Error setting loop mode:", error);
      throw error;
    }
  },

  async skipTrack(guildId: string): Promise<void> {
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        skipMode: "skip",
      });
      console.log("Track skipped:", data);
    } catch (error) {
      console.error("Error skipping track:", error);
      throw error;
    }
  },

  async previousTrack(guildId: string): Promise<void> {
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        skipMode: "previous",
      });
      console.log("Track set to previous:", data);
    } catch (error) {
      console.error("Error playing previous track:", error);
      throw error;
    }
  },

  async setVolume(guildId: string, volume: number): Promise<void> {
    try {
      const volumeValue = Math.min(1000, Math.max(0, volume));
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        volume: volumeValue,
      });
      console.log("Volume updated:", data);
    } catch (error) {
      console.error("Error changing volume:", error);
      throw error;
    }
  },

  async addTrack(guildId: string, url: string): Promise<Track[]> {
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        add: [url],
      });
      console.log("Track added:", data);
      return data.added;
    } catch (error) {
      console.error("Error adding track:", error);
      throw error;
    }
  },

  async toggleLoop(guildId: string, mode: "queue" | "song" | "none"): Promise<void> {
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        loop: mode,
      });
      console.log("Loop mode updated:", data);
    } catch (error) {
      console.error("Error updating loop mode:", error);
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
      console.log("Search results:", data);
      return data.tracks || [];
    } catch (error) {
      console.error("Error searching tracks:", error);
      throw error;
    }
  },

  async getPlaylists(requesterId: string): Promise<Playlist[]> {
    try {
      const { data } = await api.get(`/v1/playlists/${requesterId}`);
      return data.data || [];
    } catch (error) {
      console.error("Error fetching playlists:", error);
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
      console.error("Error fetching playlist:", error);
      throw error;
    }
  },

  async getShuffleStatus(guildId: string): Promise<boolean> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}/shuffle`);
      return data.shuffle;
    } catch (error) {
      console.error('Error fetching shuffle status:', error);
      throw error;
    }
  },

  async setShuffle(guildId: string, shuffle: boolean): Promise<void> {
    try {
      await api.patch(`/v1/players/${guildId}/shuffle`, { shuffle });
    } catch (error) {
      console.error('Error setting shuffle:', error);
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
      console.error('Failed to play track:', error);
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
      console.error('Error fetching available filters:', error);
      throw error;
    }
  },

  async getCurrentFilter(guildId: string): Promise<{ filter: string; amount?: number } | null> {
    try {
      const { data } = await api.get(`/v1/filters/${guildId}`);
      return data.filter || data.data?.filter || null;
    } catch (error) {
      console.error('Error fetching current filter:', error);
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
      console.log('Filter applied:', filter, amount ? `with amount ${amount}` : '');
    } catch (error) {
      console.error('Error applying filter:', error);
      throw error;
    }
  },

  async clearFilters(guildId: string): Promise<void> {
    try {
      await api.delete(`/v1/filters/${guildId}`);
      console.log('Filters cleared');
    } catch (error) {
      console.error('Error clearing filters:', error);
      throw error;
    }
  },

  async getLanguage(guildId: string, authToken?: string): Promise<{ language: string; available: string[] }> {
    try {
      const headers = authToken ? { Authorization: authToken } : undefined;
      const { data } = await api.get(`/v1/language/${guildId}`, { headers });
      return data;
    } catch (error) {
      console.error('Error fetching language:', error);
      throw error;
    }
  },
  async setLanguage(guildId: string, language: string, authToken?: string): Promise<{ success: boolean; language: string }> {
    try {
      const headers = authToken ? { Authorization: authToken } : undefined;
      const { data } = await api.patch(`/v1/language/${guildId}`, { language }, { headers });
      return data;
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  },

  async clearQueue(guildId: string): Promise<void> {
    try {
      await api.delete(`/v1/queue/${guildId}`);
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  },

  async removeFromQueue(guildId: string, position: number): Promise<void> {
    try {
      await api.delete(`/v1/queue/${guildId}/${position}`);
    } catch (error) {
      console.error('Error removing track from queue:', error);
      throw error;
    }
  },

  async checkUserAndBotInGuild(guildId: string, userId: string): Promise<{ inGuild: boolean; inSameVoice: boolean; userVoiceChannelId?: string; botVoiceChannelId?: string }> {
    try {
      const { data } = await api.get(`/v1/guild-checker/${guildId}/${userId}`);
      return data;
    } catch (error) {
      console.error('Error checking user and bot in guild:', error);
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
      console.error('Error deleting playlist:', error);
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
      console.error('Error editing playlist:', error);
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
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  async getLyrics(guildId: string): Promise<any> {
    try {
      const { data } = await api.get(`/v1/lyrics/${guildId}`);
      return data;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      throw error;
    }
  },

  async getUserHistory(userId: string): Promise<any[]> {
    try {
      const { data } = await api.get(`/v1/user-history/${userId}`);
      return data.history || [];
    } catch (error) {
      console.error('Error fetching user history:', error);
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
  async getAccessToken(): Promise<string> {
    try {
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Spotify credentials not configured');
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  },

  async getTrendingSongs(): Promise<TrendingTrack[]> {
    try {
      const accessToken = await this.getAccessToken();
      console.log('Got access token:', accessToken ? 'Success' : 'Failed');

      const testResponse = await fetch('https://api.spotify.com/v1/browse/categories?limit=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Test API call status:', testResponse.status);
      if (!testResponse.ok) {
        const testError = await testResponse.text();
        console.error('Test API error:', testError);
        throw new Error(`Spotify API test failed: ${testResponse.status}`);
      }

      const newReleasesResponse = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=48&country=US', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!newReleasesResponse.ok) {
        const errorText = await newReleasesResponse.text();
        console.error('New releases response error:', errorText);
        throw new Error(`Failed to fetch Spotify new releases: ${newReleasesResponse.status}`);
      }

      const newReleasesData = await newReleasesResponse.json();
      
      if (newReleasesData.albums?.items) {
        const tracks = newReleasesData.albums.items.map((album: any) => {
          return {
            id: album.id,
            title: album.name,
            artist: album.artists.map((artist: any) => artist.name).join(', '),
            image: album.images?.[0]?.url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center',
            url: album.external_urls?.spotify
          };
        });

        return tracks;
      } else {
        throw new Error('No new releases found');
      }
    } catch (error) {
      console.error('Error fetching trending songs:', error);
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
    console.error('Error fetching user stats:', error);
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
    console.error('Error fetching guild stats:', error);
    throw new Error(error?.message || 'Failed to load guild stats');
  }
}

export async function checkIfUserIsDJ(guildId: string, userId: string): Promise<boolean> {
  console.log('DJ_ONLY:', process.env.NEXT_PUBLIC_DJ_ONLY);
  if (process.env.NEXT_PUBLIC_DJ_ONLY !== 'true') return true;
  if (!guildId || !userId) return false;
  try {
    console.log('Calling DJ API via api instance:', guildId, userId);
    const response = await api.get(`/v1/dj/${guildId}/userid`, {
      params: { userid: userId },
    });
    console.log('DJ API response:', response.data);
    return response.data?.data === 1;
  } catch (err) {
    console.log('DJ API error:', err);
    return false;
  }
}

export async function checkIfUserIsPremium(userId: string): Promise<boolean> {
  console.log('PREMIUM_ONLY:', process.env.NEXT_PUBLIC_PREMIUM_ONLY);
  if (process.env.NEXT_PUBLIC_PREMIUM_ONLY !== 'true') return true;
  if (!userId) return false;
  try {
    const response = await api.get(`/v1/premium/user/${userId}`);
    return response.data?.data?.premium === true;
  } catch (err) {
    console.log('Premium API error:', err);
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
    console.error('Error fetching top songs:', error);
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
    console.error('Error fetching top users:', error);
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
    console.error('Error fetching last played song:', error);
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
    console.error('Error fetching user top songs:', error);
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
    console.error('Error fetching user last played song:', error);
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
    console.error('Error fetching Discord user info:', error);
    throw new Error(error?.message || 'Failed to fetch user info');
  }
}
