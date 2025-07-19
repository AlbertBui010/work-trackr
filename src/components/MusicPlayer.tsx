import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, List } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { musicService, Playlist, Video } from '../services/musicService';

interface MusicPlayerProps {
  isVisible: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  currentPlaylist?: Playlist;
  onPlaylistChange: (playlist: Playlist) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isVisible,
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  currentPlaylist,
  onPlaylistChange
}) => {
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    loadDefaultPlaylists();
  }, []);

  useEffect(() => {
    if (currentPlaylist) {
      loadPlaylistVideos(currentPlaylist.id);
    }
  }, [currentPlaylist]);

  const loadDefaultPlaylists = async () => {
    try {
      setLoading(true);
      const defaultPlaylists = musicService.getDefaultPlaylists();
      setPlaylists(defaultPlaylists);
      
      // Set first playlist as default
      if (defaultPlaylists.length > 0 && !currentPlaylist) {
        onPlaylistChange(defaultPlaylists[0]);
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistVideos = async (playlistId: string) => {
    try {
      setLoading(true);
      const videos = await musicService.getPlaylistVideos(playlistId);
      setPlaylistVideos(videos);
      
      if (videos.length > 0) {
        setCurrentVideo(videos[0]);
        setCurrentVideoIndex(0);
      }
    } catch (error) {
      console.error('Error loading playlist videos:', error);
      // Fallback to default videos
      const fallbackVideos = await musicService.searchVideos('lofi hip hop');
      setPlaylistVideos(fallbackVideos);
      if (fallbackVideos.length > 0) {
        setCurrentVideo(fallbackVideos[0]);
        setCurrentVideoIndex(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (playlistVideos.length > 0) {
      const nextIndex = (currentVideoIndex + 1) % playlistVideos.length;
      setCurrentVideoIndex(nextIndex);
      setCurrentVideo(playlistVideos[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (playlistVideos.length > 0) {
      const prevIndex = currentVideoIndex === 0 ? playlistVideos.length - 1 : currentVideoIndex - 1;
      setCurrentVideoIndex(prevIndex);
      setCurrentVideo(playlistVideos[prevIndex]);
    }
  };

  const handleVideoEnd = () => {
    handleNext();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-slate-800 rounded-xl p-4 border border-slate-700"
    >
      {/* Hidden YouTube Player */}
      {currentVideo && (
        <div className="hidden">
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${currentVideo.id}`}
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            onEnded={handleVideoEnd}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  disablekb: 1,
                  fs: 0,
                  iv_load_policy: 3,
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0
                }
              }
            }}
          />
        </div>
      )}

      {/* Music Player UI */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
            {currentVideo?.thumbnail ? (
              <img
                src={currentVideo.thumbnail}
                alt={currentVideo.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Music className="h-6 w-6 text-slate-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-100 truncate">
              {currentVideo?.title || 'No track selected'}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {currentPlaylist?.title || 'No playlist'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={playlistVideos.length === 0}
            className="text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          
          <button
            onClick={onPlayPause}
            disabled={!currentVideo}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors duration-200"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <button
            onClick={handleNext}
            disabled={playlistVideos.length === 0}
            className="text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Playlist Selector */}
        <button
          onClick={() => setShowPlaylistSelector(!showPlaylistSelector)}
          className="text-slate-400 hover:text-white transition-colors duration-200"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Playlist Selector Modal */}
      <AnimatePresence>
        {showPlaylistSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-slate-100 mb-3">Choose Playlist</h3>
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      onPlaylistChange(playlist);
                      setShowPlaylistSelector(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      currentPlaylist?.id === playlist.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={playlist.thumbnail}
                        alt={playlist.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{playlist.title}</h4>
                        <p className="text-xs opacity-75 truncate">{playlist.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="mt-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-xs text-slate-400">Loading music...</span>
        </div>
      )}
    </motion.div>
  );
};

export default MusicPlayer;