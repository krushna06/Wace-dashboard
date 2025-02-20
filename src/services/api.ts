import axios from 'axios';

const api = axios.create({
  baseURL: 'https://10002-krushna06-wace-k7yhh2obqw9.ws-us117.gitpod.io',
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
}

export const musicApi = {
  async getPlayer(guildId: string): Promise<PlayerState> {
    const { data } = await api.get(`/v1/players/${guildId}`);
    return data;
  },

  async getCurrentTrack(guildId: string): Promise<Track | null> {
    const { data } = await api.get(`/v1/players/${guildId}/current`);
    return data.data;
  },

  async getQueue(guildId: string): Promise<Track[]> {
    const { data } = await api.get(`/v1/players/${guildId}/queue`);
    return data.data;
  },

  async togglePlay(guildId: string, isPaused: boolean): Promise<void> {
    await api.patch(`/v1/players/${guildId}`, {
      pause: isPaused
    });
  },

  async setPosition(guildId: string, position: number): Promise<void> {
    await api.patch(`/v1/players/${guildId}`, {
      position
    });
  },

  async setLoop(guildId: string, mode: 'none' | 'track' | 'queue'): Promise<void> {
    await api.patch(`/v1/players/${guildId}`, {
      loop: mode
    });
  },

  async skipTrack(guildId: string): Promise<void> {
    await api.patch(`/v1/players/${guildId}`, {
      skipMode: 'single'
    });
  },

  async previousTrack(guildId: string): Promise<void> {
    await api.patch(`/v1/players/${guildId}`, {
      skipMode: 'previous'
    });
  },

  async setVolume(guildId: string, volume: number): Promise<void> {
    await api.patch(`/v1/players/${guildId}`, {
      volume: Math.min(1000, Math.max(0, volume))
    });
  },

  async addTrack(guildId: string, url: string): Promise<Track[]> {
    const { data } = await api.patch(`/v1/players/${guildId}`, {
      add: [url]
    });
    return data.added;
  }
};