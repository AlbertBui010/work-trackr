import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  videos?: Video[];
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
}

export class MusicService {
  private static instance: MusicService;
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();

  static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any, ttlMinutes = 30): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttlMinutes * 60 * 1000);
  }

  async searchPlaylists(query: string, maxResults = 10): Promise<Playlist[]> {
    const cacheKey = `playlists_${query}_${maxResults}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      if (!YOUTUBE_API_KEY) {
        return this.getFallbackPlaylists();
      }

      const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          key: YOUTUBE_API_KEY,
          part: 'snippet',
          type: 'playlist',
          q: query,
          maxResults,
          order: 'relevance'
        }
      });

      const playlists: Playlist[] = response.data.items.map((item: any) => ({
        id: item.id.playlistId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        videoCount: 0 // Will be fetched separately if needed
      }));

      this.setCache(cacheKey, playlists);
      return playlists;
    } catch (error) {
      console.error('Error searching playlists:', error);
      return this.getFallbackPlaylists();
    }
  }

  async getPlaylistVideos(playlistId: string, maxResults = 20): Promise<Video[]> {
    const cacheKey = `playlist_videos_${playlistId}_${maxResults}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      if (!YOUTUBE_API_KEY) {
        return this.getFallbackVideos();
      }

      const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        params: {
          key: YOUTUBE_API_KEY,
          part: 'snippet',
          playlistId,
          maxResults
        }
      });

      const videos: Video[] = response.data.items.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: '', // Would need additional API call to get duration
        channelTitle: item.snippet.channelTitle
      }));

      this.setCache(cacheKey, videos);
      return videos;
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      return this.getFallbackVideos();
    }
  }

  async searchVideos(query: string, maxResults = 10): Promise<Video[]> {
    const cacheKey = `videos_${query}_${maxResults}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      if (!YOUTUBE_API_KEY) {
        return this.getFallbackVideos();
      }

      const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          key: YOUTUBE_API_KEY,
          part: 'snippet',
          type: 'video',
          q: query,
          maxResults,
          order: 'relevance',
          videoCategoryId: '10' // Music category
        }
      });

      const videos: Video[] = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: '',
        channelTitle: item.snippet.channelTitle
      }));

      this.setCache(cacheKey, videos);
      return videos;
    } catch (error) {
      console.error('Error searching videos:', error);
      return this.getFallbackVideos();
    }
  }

  getDefaultPlaylists(): Playlist[] {
    return [
      {
        id: 'PLrAD5IUBijWcwRO78_8eZmFOcLW5_eEzN',
        title: 'Lo-fi Hip Hop for Focus',
        description: 'Chill beats perfect for concentration and productivity',
        thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg',
        videoCount: 50
      },
      {
        id: 'PLYCLhBEJhqKhKKKKKKKKKKKKKKKKKKKKK',
        title: 'Classical Music for Work',
        description: 'Peaceful classical pieces to enhance focus',
        thumbnail: 'https://i.ytimg.com/vi/vN4U5FqrOdQ/mqdefault.jpg',
        videoCount: 30
      },
      {
        id: 'PLrAD5IUBijWcwRO78_8eZmFOcLW5_eEzN',
        title: 'Nature Sounds & Ambient',
        description: 'Relaxing nature sounds for deep work sessions',
        thumbnail: 'https://i.ytimg.com/vi/WeOVJK2nOqM/mqdefault.jpg',
        videoCount: 25
      },
      {
        id: 'PLrAD5IUBijWcwRO78_8eZmFOcLW5_eEzN',
        title: 'Instrumental Focus Music',
        description: 'Instrumental tracks without lyrics for maximum concentration',
        thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/mqdefault.jpg',
        videoCount: 40
      }
    ];
  }

  private getFallbackPlaylists(): Playlist[] {
    return this.getDefaultPlaylists();
  }

  private getFallbackVideos(): Video[] {
    return [
      {
        id: 'jfKfPfyJRdk',
        title: 'lofi hip hop radio - beats to relax/study to',
        thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg',
        duration: 'LIVE',
        channelTitle: 'Lofi Girl'
      },
      {
        id: 'vN4U5FqrOdQ',
        title: 'Classical Music for Brain Power',
        thumbnail: 'https://i.ytimg.com/vi/vN4U5FqrOdQ/mqdefault.jpg',
        duration: '3:00:00',
        channelTitle: 'Classical Music'
      }
    ];
  }

  // Alternative music sources when YouTube is not available
  async getAlternativeMusic(): Promise<any[]> {
    // This could integrate with other APIs like:
    // - TheAudioDB for free music
    // - SoundCloud API
    // - Spotify Web API (for previews)
    // - Free Music Archive API
    
    return [
      {
        id: 'ambient-1',
        title: 'Forest Ambience',
        url: 'https://www.soundjay.com/misc/sounds/forest-ambience.mp3',
        type: 'ambient'
      },
      {
        id: 'ambient-2',
        title: 'Rain Sounds',
        url: 'https://www.soundjay.com/misc/sounds/rain.mp3',
        type: 'ambient'
      }
    ];
  }
}

export const musicService = MusicService.getInstance();