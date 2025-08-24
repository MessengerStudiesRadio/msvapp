


import React from 'react';
import type { Teaching } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import NextIcon from './icons/NextIcon';
import PrevIcon from './icons/PrevIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';
import VolumeDownIcon from './icons/VolumeDownIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import RepeatIcon from './icons/RepeatIcon';
import RepeatOneIcon from './icons/RepeatOneIcon';
import StopIcon from './icons/StopIcon';
import QueueIcon from './icons/QueueIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';

interface PlayerControlsProps {
  currentItem: Teaching | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
  onToggleQueueVisibility: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'none' | 'one' | 'all';
  onCycleRepeatMode: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '0:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentItem,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onStop,
  onToggleQueueVisibility,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeatMode,
  isMinimized,
  onToggleMinimize,
}) => {
  const noItem = !currentItem;

  const imageUrl = currentItem ? currentItem.coverArtUrl : '';
  const title = currentItem ? currentItem.title : "Nothing Playing";
  const seriesName = currentItem ? currentItem.seriesName : '';

  const repeatTooltipText = repeatMode === 'none' ? 'Enable Repeat All' : repeatMode === 'all' ? 'Enable Repeat One' : 'Disable Repeat';

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const width = rect.width;
      const newTime = (x / width) * duration;
      onSeek(newTime);
  };


  if (isMinimized) {
    return (
      <div className="bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-lg text-gray-800 dark:text-white shadow-2xl-top relative h-20">
        <div 
          className="absolute top-0 left-0 w-full h-2 cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-300 dark:bg-gray-600 group-hover:h-2 transition-all">
            <div className="h-full bg-primary-400" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        <div className="p-2 px-4 flex items-center justify-between h-full">
          <div className="flex items-center min-w-0 w-1/3">
            {currentItem && (
                <>
                    <img src={imageUrl} alt={title} className="w-14 h-14 rounded-md shadow-md flex-shrink-0 object-cover" />
                    <div className="min-w-0 ml-3 hidden sm:block">
                      <p className="font-bold truncate text-sm">{title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{seriesName}</p>
                    </div>
                </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button onClick={onPrev} disabled={noItem} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-primary-400 transition-colors" aria-label="Previous">
              <PrevIcon className="w-5 h-5" />
            </button>
            <button onClick={onPlayPause} disabled={noItem} className="p-2 rounded-full bg-primary-500 text-white dark:text-gray-900 hover:bg-primary-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
            </button>
            <button onClick={onNext} disabled={noItem} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-primary-400 transition-colors" aria-label="Next">
              <NextIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-end space-x-2 w-1/3">
            <div className="hidden lg:flex items-center space-x-2">
              <VolumeDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer" />
              <VolumeUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
            </div>
            <div className="relative group">
              <button onClick={onToggleQueueVisibility} disabled={noItem} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-primary-400 transition-colors" aria-label="View Queue">
                  <QueueIcon className="w-5 h-5" />
              </button>
              <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">View Queue</span>
            </div>
             <div className="relative group">
              <button onClick={onToggleMinimize} className="p-2 hover:text-primary-400 transition-colors" aria-label="Expand player">
                <ChevronUpIcon className="w-5 h-5" />
              </button>
              <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Expand</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-800 dark:text-white shadow-2xl-top relative">
       <div className="absolute top-2 right-2 group">
          <button onClick={onToggleMinimize} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Minimize player">
              <ChevronDownIcon className="w-5 h-5" />
          </button>
          <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Minimize</span>
       </div>
      <div className="p-4 flex flex-col md:flex-row md:items-center">
        {/* Info */}
        <div className="w-full md:w-1/4 flex items-center min-w-0">
          {currentItem ? (
              <>
                <img src={imageUrl} alt={title} className="w-14 h-14 rounded-lg mr-4 shadow-md flex-shrink-0 object-cover" />
                <div className="min-w-0">
                  <p className="font-bold truncate text-sm md:text-base">{title}</p>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{seriesName}</p>
                </div>
              </>
            ) : (
              <div className="w-full h-14 flex items-center">
                  <div className="w-14 h-14 rounded-lg mr-4 bg-gray-200 dark:bg-gray-700"/>
                  <div>
                      <p className="font-bold text-gray-500 dark:text-gray-400">Nothing Playing</p>
                  </div>
              </div>
          )}
        </div>
        
        {/* Main Controls & Progress Bar */}
        <div className="w-full md:w-1/2 flex flex-col items-center mt-3 md:mt-0">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button onClick={onToggleShuffle} disabled={noItem} className={`disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isShuffle ? 'text-primary-400' : 'hover:text-gray-800 dark:hover:text-white'}`} aria-label="Toggle Shuffle">
                <ShuffleIcon className="w-5 h-5" />
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">{isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}</span>
            </div>
            <div className="relative group">
              <button onClick={onPrev} disabled={noItem} className="disabled:opacity-50 disabled:cursor-not-allowed hover:text-primary-400 transition-colors" aria-label="Previous">
                <PrevIcon className="w-6 h-6" />
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Previous</span>
            </div>
            <div className="relative group">
              <button onClick={onPlayPause} disabled={noItem} className="p-3 rounded-full bg-primary-500 text-white dark:text-gray-900 hover:bg-primary-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed scale-110" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">{isPlaying ? 'Pause' : 'Play'}</span>
            </div>
            <div className="relative group">
              <button onClick={onNext} disabled={noItem} className="disabled:opacity-50 disabled:cursor-not-allowed hover:text-primary-400 transition-colors" aria-label="Next">
                <NextIcon className="w-6 h-6" />
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Next</span>
            </div>
            <div className="relative group">
              <button onClick={onCycleRepeatMode} disabled={noItem} className={`disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${repeatMode !== 'none' ? 'text-primary-400' : 'hover:text-gray-800 dark:hover:text-white'}`} aria-label="Cycle Repeat Mode">
                {repeatMode === 'one' ? <RepeatOneIcon className="w-5 h-5"/> : <RepeatIcon className="w-5 h-5" />}
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">{repeatTooltipText}</span>
            </div>
          </div>
          <div className="w-full max-w-xl flex items-center space-x-2 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={noItem}
              className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Other Controls */}
        <div className="w-full md:w-1/4 flex items-center justify-center md:justify-end space-x-4 mt-3 md:mt-0">
            <div className="relative group">
                <button onClick={onStop} disabled={noItem} className="disabled:opacity-50 disabled:cursor-not-allowed hover:text-red-500 transition-colors" aria-label="Stop Playback">
                    <StopIcon className="w-5 h-5" />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Stop & Clear Queue</span>
            </div>
            <div className="relative group">
                <button onClick={onToggleQueueVisibility} disabled={noItem} className="disabled:opacity-50 disabled:cursor-not-allowed hover:text-primary-400 transition-colors" aria-label="View Queue">
                    <QueueIcon className="w-5 h-5" />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">View Queue</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <VolumeDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
              <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
              <VolumeUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
            </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 pb-1">&copy; Messenger Studies 2025</p>
    </div>
  );
};

export default PlayerControls;
