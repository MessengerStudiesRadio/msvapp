


import React from 'react';
import type { Teaching } from '../types';
import PlusIcon from './icons/PlusIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';
import QueuePlusIcon from './icons/QueuePlusIcon';

interface TeachingLibraryProps {
  teachings: Teaching[];
  onPlay: (teaching: Teaching, queue: Teaching[]) => void;
  onSelectTeachingToAdd: (teaching: Teaching) => void;
  onViewDetails: (teaching: Teaching) => void;
  onAddToQueue: (teaching: Teaching) => void;
  currentTeachingId?: number;
  isPlaying: boolean;
  searchQuery: string;
}

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

const TeachingLibrary: React.FC<TeachingLibraryProps> = ({ teachings, onPlay, onSelectTeachingToAdd, onViewDetails, onAddToQueue, currentTeachingId, isPlaying, searchQuery }) => {
  const now = Date.now();

  const filteredTeachings = teachings.filter(teaching => {
    const query = searchQuery.toLowerCase();
    return (
        teaching.title.toLowerCase().includes(query) ||
        teaching.seriesName.toLowerCase().includes(query) ||
        (teaching.description && teaching.description.toLowerCase().includes(query))
    );
  });

  const newReleases = filteredTeachings
    .filter(teaching => now - teaching.dateAdded < SEVEN_DAYS_IN_MS)
    .sort((a, b) => b.dateAdded - a.dateAdded);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold text-primary-400 dark:text-primary-300">Teaching Library</h2>
      </div>

      <div className="overflow-y-auto flex-grow">
        {/* New Releases Section */}
        {newReleases.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">New Releases</h3>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {newReleases.map(teaching => (
                <div key={teaching.id} className="flex-shrink-0 w-32 group relative">
                  <img
                    src={teaching.coverArtUrl}
                    alt={teaching.title}
                    className="w-32 h-32 rounded-lg object-cover shadow-lg cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => onViewDetails(teaching)}
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <button
                      onClick={() => onPlay(teaching, filteredTeachings)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
                      aria-label="Play"
                    >
                      {currentTeachingId === teaching.id && isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => onSelectTeachingToAdd(teaching)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
                      aria-label="Add to playlist"
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => onAddToQueue(teaching)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
                        aria-label="Add to queue"
                    >
                        <QueuePlusIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mt-2 text-center cursor-pointer" onClick={() => onViewDetails(teaching)}>
                    <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-100 group-hover:text-primary-400">{teaching.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{teaching.seriesName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Episodes Section */}
        <div className="p-4">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">All Teachings</h3>
        </div>

        {filteredTeachings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center px-4 pb-4">No teachings found{searchQuery && ` for "${searchQuery}"`}.</p>
        ) : (
            <ul>
            {filteredTeachings.map(teaching => {
                const isCurrentlyPlaying = currentTeachingId === teaching.id && isPlaying;
                const isCurrentTeaching = currentTeachingId === teaching.id;
                const isNew = now - teaching.dateAdded < SEVEN_DAYS_IN_MS;

                return (
                <li
                    key={teaching.id}
                    className={`flex items-center p-3 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 ${isCurrentTeaching ? 'bg-primary-500/10' : ''}`}
                >
                    <img src={teaching.coverArtUrl} alt={teaching.title} className="w-10 h-10 rounded-md mr-4 object-cover flex-shrink-0" />
                    <div onClick={() => onViewDetails(teaching)} className="flex-grow min-w-0 cursor-pointer group">
                    <div className="flex items-center space-x-2">
                        <p className={`font-semibold truncate group-hover:underline text-base ${isCurrentTeaching ? 'text-primary-400' : 'text-gray-800 dark:text-gray-100'}`}>{teaching.title}</p>
                        {isNew && <span className="text-xs font-bold bg-primary-400 text-white px-2 py-0.5 rounded-full">NEW</span>}
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{teaching.seriesName}</p>
                    </div>
                    {isCurrentTeaching && <VolumeUpIcon className="w-5 h-5 text-primary-400 mr-4 animate-pulse" />}
                    <div className="flex items-center space-x-2">
                        <div className="relative group">
                        <button
                            onClick={() => onPlay(teaching, filteredTeachings)}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-primary-500 text-gray-700 dark:text-gray-200 hover:text-white transition-all duration-200"
                            aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
                        >
                            {isCurrentlyPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {isCurrentlyPlaying ? 'Pause' : 'Play'}
                        </span>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={() => onAddToQueue(teaching)}
                                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-green-500 text-gray-700 dark:text-gray-200 hover:text-white transition-all duration-200"
                                aria-label="Add to queue"
                            >
                                <QueuePlusIcon className="w-5 h-5" />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                Add to Queue
                            </span>
                        </div>
                        <div className="relative group">
                        <button
                            onClick={() => onSelectTeachingToAdd(teaching)}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 text-gray-700 dark:text-gray-200 hover:text-white transition-all duration-200"
                            aria-label="Add to playlist"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            Add to playlist
                        </span>
                        </div>
                    </div>
                </li>
                );
            })}
            </ul>
        )}
      </div>
    </div>
  );
};

export default TeachingLibrary;
