import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon
} from '@heroicons/react/24/solid';

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return '0:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AudioPlayer = ({ 
  audioUrl, 
  onEnded,
  onPrevious,
  onNext,
  autoPlay = false,
  className = ''
}) => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Handle progress bar interaction
  const handleProgressClick = useCallback((e) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  }, []);

  // Set up event listeners and handle auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return () => {};

    const handleAudioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    if (autoPlay) {
      audio.play().catch(error => {
        console.error("Auto-play failed:", error);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('play', () => {});
      audio.removeEventListener('pause', () => {});
    };
  }, [audioUrl, handleTimeUpdate, handleLoadedMetadata, onEnded, autoPlay]);

  // Handle audio source changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = isPlaying;
    audio.pause();

    if (audioUrl) {
      audio.src = audioUrl;
      audio.load();

      if (wasPlaying) {
        audio.play().catch(console.error);
      }
    } else {
      audio.src = '';
    }
  }, [audioUrl, isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  if (!audioUrl) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex items-center space-x-2 sm:space-x-4 w-full">
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="p-1 sm:p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
            aria-label="Previous track"
          >
            <BackwardIcon className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={togglePlayPause}
          className="p-2 sm:p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </button>

        {onNext && (
          <button
            onClick={onNext}
            className="p-1 sm:p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
            aria-label="Next track"
          >
            <ForwardIcon className="h-5 w-5" />
          </button>
        )}

        <div className="text-xs sm:text-sm text-gray-600 w-16 sm:w-20 text-center">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div 
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
        >
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="relative">
          <button
            onClick={toggleMute}
            onMouseEnter={() => setIsVolumeOpen(true)}
            onMouseLeave={() => !isVolumeOpen && setIsVolumeOpen(false)}
            className="p-1 sm:p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <SpeakerXMarkIcon className="h-5 w-5" />
            ) : volume < 0.5 ? (
              <SpeakerWaveIcon className="h-5 w-5" />
            ) : (
              <SpeakerWaveIcon className="h-5 w-5" />
            )}
          </button>
          
          {isVolumeOpen && (
            <div 
              className="absolute bottom-full right-0 mb-2 p-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              onMouseEnter={() => setIsVolumeOpen(true)}
              onMouseLeave={() => setIsVolumeOpen(false)}
            >
              <input
                ref={volumeBarRef}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                aria-label="Volume control"
              />
            </div>
          )}
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        className="hidden"
      />
    </div>
  );
};

export default AudioPlayer;