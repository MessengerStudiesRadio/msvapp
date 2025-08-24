


import React from 'react';
import type { Teaching } from '../types';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import PlayIcon from './icons/PlayIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';

interface QueueListProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Teaching[];
  currentItemId?: number;
  onPlayFromQueue: (index: number) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  isPlaying: boolean;
}

const QueueList: React.FC<QueueListProps> = ({
  isOpen,
  onClose,
  queue,
  currentItemId,
  onPlayFromQueue,
  onRemoveFromQueue,
  onClearQueue,
  isPlaying,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-[60]" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="queue-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="queue-title" className="text-lg font-semibold text-primary-400 dark:text-primary-300">
            Playback Queue
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearQueue}
              disabled={queue.length <= 1}
              className="flex items-center space-x-1.5 text-sm text-gray-500 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Clear queue"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Clear</span>
            </button>
            <div className="relative group">
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" aria-label="Close queue">
                <XIcon className="w-5 h-5" />
              </button>
              <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Close</span>
            </div>
          </div>
        </header>
        
        <div className="overflow-y-auto flex-grow">
          {queue.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center p-8">The queue is empty.</p>
          ) : (
            <ul>
              {queue.map((item, index) => {
                const isCurrentItem = item.id === currentItemId;

                return (
                  <li
                    key={`${item.id}-${index}`}
                    className={`flex items-center p-3 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 group transition-colors duration-200 ${isCurrentItem ? 'bg-primary-500/10' : ''}`}
                  >
                    <img src={item.coverArtUrl} alt={item.title} className="w-10 h-10 rounded-md mr-4 object-cover flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className={`font-semibold truncate text-base ${isCurrentItem ? 'text-primary-400' : 'text-gray-800 dark:text-gray-100'}`}>{item.title}</p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{item.seriesName}</p>
                    </div>
                    {isCurrentItem && <VolumeUpIcon className="w-5 h-5 text-primary-400 mr-4 animate-pulse" />}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isCurrentItem && (
                          <div className="relative group/item">
                            <button onClick={() => onPlayFromQueue(index)} className="p-2 rounded-full hover:bg-primary-500/20" aria-label="Play this item">
                                <PlayIcon className="w-5 h-5 text-primary-400" />
                            </button>
                            <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-20">Play</span>
                          </div>
                      )}
                      <div className="relative group/item">
                        <button onClick={() => onRemoveFromQueue(index)} className="p-2 rounded-full hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isCurrentItem} aria-label="Remove from queue">
                            <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                        <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-20">Remove</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueList;