import axios from 'axios';

const api = axios.create({
  baseURL: 'https://3000-krushna06-wace-o0t5f1hu4k2.ws-us118.gitpod.io',
  headers: {
    'Authorization': 'dornox06',
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

export const musicApi = {
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
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        skipMode: "normal",
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

  async setLoop(guildId: string, mode: "none" | "track" | "queue"): Promise<void> {
    try {
      const { data } = await api.patch(`/v1/players/${guildId}`, {
        loop: mode,
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
};
