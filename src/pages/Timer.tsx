import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Settings, Music } from 'lucide-react';
import { useWorkLogs } from '../contexts/WorkLogContext';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../lib/supabase';
import MusicPlayer from '../components/MusicPlayer';
import { musicService, Playlist } from '../services/musicService';

const Timer: React.FC = () => {
  const [mode, setMode] = useState<'pomodoro' | 'custom'>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [customMinutes, setCustomMinutes] = useState(25);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    type: 'Deep Work' as const,
    tags: [] as string[]
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addWorkLog } = useWorkLogs();
  const { user } = useSupabaseAuth();

  // Load user preferences
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setUserPreferences(data);
        setMusicVolume(data.music_volume);
        setShowMusicPlayer(data.music_enabled);
        
        // Set custom durations
        if (mode === 'custom') {
          setCustomMinutes(data.pomodoro_duration);
          setTimeLeft(data.pomodoro_duration * 60);
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setMusicPlaying(false);
    
    if (mode === 'pomodoro') {
      if (!isBreak) {
        // Work session completed
        setCycles(prev => prev + 1);
        
        // Create work log if session data is provided
        if (sessionData.title) {
          const duration = customMinutes;
          addWorkLog({
            title: sessionData.title,
            description: sessionData.description,
            startTime: new Date(Date.now() - duration * 60 * 1000),
            endTime: new Date(),
            tags: sessionData.tags,
            type: sessionData.type,
            duration
          });
        }

        // Start break
        setIsBreak(true);
        const breakDuration = cycles > 0 && (cycles + 1) % 4 === 0 ? 15 : 5; // Long break every 4 cycles
        setTimeLeft(breakDuration * 60);
      } else {
        // Break completed
        setIsBreak(false);
        setTimeLeft(25 * 60);
      }
    } else {
      // Custom timer completed
      if (sessionData.title) {
        const duration = customMinutes;
        addWorkLog({
          title: sessionData.title,
          description: sessionData.description,
          startTime: new Date(Date.now() - duration * 60 * 1000),
          endTime: new Date(),
          tags: sessionData.tags,
          type: sessionData.type,
          duration
        });
      }
    }

    // Play notification sound (browser notification)
    new Notification('Timer Complete!', {
      body: isBreak ? 'Break time is over!' : 'Work session completed!',
      icon: '/favicon.ico'
    });
  };

  const startTimer = () => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
    if (showMusicPlayer && userPreferences?.music_enabled) {
      setMusicPlaying(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setMusicPlaying(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setMusicPlaying(false);
    resetTimer();
  };

  const resetTimer = () => {
    if (mode === 'pomodoro') {
      setTimeLeft(25 * 60);
      setIsBreak(false);
    } else {
      setTimeLeft(customMinutes * 60);
    }
  };

  const setCustomTimer = () => {
    setMode('custom');
    setTimeLeft(customMinutes * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'pomodoro' 
    ? (isBreak ? (5 * 60 - timeLeft) / (5 * 60) : (25 * 60 - timeLeft) / (25 * 60)) * 100
    : (customMinutes * 60 - timeLeft) / (customMinutes * 60) * 100;

  const toggleMusicPlayer = () => {
    setShowMusicPlayer(!showMusicPlayer);
    if (!showMusicPlayer) {
      setMusicPlaying(false);
    }
  };

  const handleMusicPlayPause = () => {
    setMusicPlaying(!musicPlaying);
  };

  const handleVolumeChange = async (volume: number) => {
    setMusicVolume(volume);
    
    // Save to user preferences
    if (user) {
      try {
        await supabase
          .from('user_preferences')
          .update({ music_volume: volume })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving volume preference:', error);
      }
    }
  };

  const handlePlaylistChange = async (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    
    // Save to user preferences
    if (user) {
      try {
        const { data: currentPrefs } = await supabase
          .from('user_preferences')
          .select('favorite_playlists')
          .eq('user_id', user.id)
          .single();

        const favoritePlaylists = currentPrefs?.favorite_playlists || [];
        const updatedPlaylists = [playlist, ...favoritePlaylists.filter((p: any) => p.id !== playlist.id)].slice(0, 5);

        await supabase
          .from('user_preferences')
          .update({ favorite_playlists: updatedPlaylists })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving playlist preference:', error);
      }
    }
  };
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Timer</h1>
          <p className="text-slate-400">Track your work sessions with Pomodoro or custom timers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timer Display */}
          <div className="bg-slate-800 rounded-xl p-8 space-y-6">
            <div className="text-center mb-8">
              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#334155"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-slate-100">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      {mode === 'pomodoro' 
                        ? (isBreak ? 'Break Time' : 'Work Time')
                        : 'Custom Timer'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {mode === 'pomodoro' && (
                <div className="text-sm text-slate-400 mb-6">
                  Cycle {cycles + 1} • Next: {isBreak ? 'Work Session' : 
                    (cycles > 0 && (cycles + 1) % 4 === 0 ? 'Long Break (15min)' : 'Short Break (5min)')}
                </div>
              )}

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-colors duration-200"
                  >
                    <Play className="h-6 w-6" />
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-full transition-colors duration-200"
                  >
                    <Pause className="h-6 w-6" />
                  </button>
                )}
                
                <button
                  onClick={stopTimer}
                  className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors duration-200"
                >
                  <Square className="h-6 w-6" />
                </button>
                
                <button
                  onClick={resetTimer}
                  className="bg-slate-600 hover:bg-slate-700 text-white p-4 rounded-full transition-colors duration-200"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Music Player Toggle */}
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={toggleMusicPlayer}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  showMusicPlayer
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Music className="h-4 w-4" />
                <span className="text-sm">
                  {showMusicPlayer ? 'Hide Music' : 'Show Music'}
                </span>
              </button>
            </div>

            {/* Music Player */}
            {showMusicPlayer && (
              <MusicPlayer
                isVisible={showMusicPlayer}
                isPlaying={musicPlaying && isRunning}
                onPlayPause={handleMusicPlayPause}
                volume={musicVolume}
                onVolumeChange={handleVolumeChange}
                currentPlaylist={currentPlaylist}
                onPlaylistChange={handlePlaylistChange}
              />
            )}

            {/* Timer Mode Selector */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setMode('pomodoro')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  mode === 'pomodoro'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Pomodoro
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  mode === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Custom
              </button>
            </div>

            {mode === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration (minutes)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={setCustomTimer}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Session Data */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Session Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={sessionData.title}
                  onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What are you working on?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={sessionData.description}
                  onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Work Type
                </label>
                <select
                  value={sessionData.type}
                  onChange={(e) => setSessionData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Coding">Coding</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Study">Study</option>
                  <option value="Deep Work">Deep Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={sessionData.tags.join(', ')}
                  onChange={(e) => setSessionData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="react, frontend, ui"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-300">
                <strong>Note:</strong> When the timer completes, a work log will be automatically created 
                with the session details above (if title is provided).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;