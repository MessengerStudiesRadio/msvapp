


import React from 'react';
import type { Teaching } from '../types';
import BackIcon from '../components/icons/BackIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import PlusIcon from '../components/icons/PlusIcon';
import QueuePlusIcon from '../components/icons/QueuePlusIcon';

interface DetailPageProps {
  item: Teaching;
  onBack: () => void;
  onPlay: (item: Teaching) => void;
  onAddToPlaylist: (item: Teaching) => void;
  onAddToQueue: (item: Teaching) => void;
  isPlaying: boolean;
}

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">{label}</p>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">{value}</p>
        </div>
    );
};

const DetailPage: React.FC<DetailPageProps> = ({ item, onBack, onPlay, onAddToPlaylist, onAddToQueue, isPlaying }) => {
  return (
    <main className="flex-grow p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 relative group">
          <button onClick={onBack} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-primary-400 transition-colors duration-200">
            <BackIcon className="w-6 h-6" />
            <span>Back to Library</span>
          </button>
           <span className="absolute bottom-full left-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Go Back</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <img src={item.coverArtUrl} alt={item.title} className="w-full h-auto rounded-lg shadow-2xl aspect-square object-cover" />
          </div>
          <div className="md:col-span-2 flex flex-col">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">{item.title}</h2>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mt-1">{item.seriesName}</p>
            
            <div className="flex items-center space-x-2 md:space-x-4 my-6">
                <div className="relative group">
                    <button onClick={() => onPlay(item)} className="flex items-center justify-center space-x-2 w-auto px-6 py-3 bg-primary-500 text-white dark:text-gray-900 font-bold rounded-full hover:bg-primary-400 transition-colors shadow-lg">
                        {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">{isPlaying ? 'Pause' : 'Play'}</span>
                </div>
                <div className="relative group">
                    <button onClick={() => onAddToQueue(item)} className="flex items-center justify-center space-x-2 w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <QueuePlusIcon className="w-6 h-6"/>
                        <span>Add to Queue</span>
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Add to Queue</span>
                </div>
                <div className="relative group">
                    <button onClick={() => onAddToPlaylist(item)} className="flex items-center justify-center space-x-2 w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                       <PlusIcon className="w-6 h-6"/>
                       <span>Add to List</span>
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Add to playlist</span>
                </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <DetailItem label="Episode" value={item.episodeNumber} />
                <DetailItem label="Release Date" value={item.releaseDate} />
                {item.description && (
                <div>
                    <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">Description</p>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>
                </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center pt-8">
        <p className="text-xs text-gray-500">&copy; Messenger Studies 2025</p>
      </footer>
    </main>
  );
};

export default DetailPage;
