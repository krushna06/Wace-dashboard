import axios from 'axios';

const REQUESTER_ID = '853620650592567304';

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
      console.error('Error fetching volume:', error);
      throw error;
    }
  },
  async getPlayer(guildId: string): Promise<PlayerState> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}`);
      return data;
    } catch (error) {
      console.error("Error fetching player state:", error);
      throw error;
    }
  },

  async getCurrentTrack(guildId: string): Promise<Track | null> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}/current`);
      return data.data;
    } catch (error) {
      console.error("Error fetching current track:", error);
      throw error;
    }
  },

  async getQueue(guildId: string): Promise<Track[]> {
    try {
      const { data } = await api.get(`/v1/players/${guildId}/queue`);
      return data.data;
    } catch (error) {
      console.error("Error fetching queue:", error);
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

  async getPlaylists(userId: string): Promise<Playlist[]> {
    try {
      const { data } = await api.get(`/v1/playlists/${userId}`);
      console.log("Playlists fetched:", data);
      return data.data || [];
    } catch (error) {
      console.error("Error fetching playlists:", error);
      throw error;
    }
  },

  async getPlaylist(id: string): Promise<Playlist> {
    try {
      const playlists = await this.getPlaylists(REQUESTER_ID);
      
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
};
