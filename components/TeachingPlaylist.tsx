


import React, { useState } from 'react';
import type { Teaching, TeachingPlaylist as TeachingPlaylistType } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';
import BackIcon from './icons/BackIcon';
import QueuePlusIcon from './icons/QueuePlusIcon';

interface TeachingPlaylistProps {
  playlists: TeachingPlaylistType[];
  onPlay: (teaching: Teaching, queue: Teaching[]) => void;
  onRemoveFromPlaylist: (playlistId: number, teachingId: number) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (playlistId: number) => void;
  onViewDetails: (teaching: Teaching) => void;
  onAddToQueue: (teaching: Teaching) => void;
  currentTeachingId?: number;
  isPlaying: boolean;
  searchQuery: string;
}

const TeachingPlaylist: React.FC<TeachingPlaylistProps> = ({ playlists, onPlay, onRemoveFromPlaylist, onCreatePlaylist, onDeletePlaylist, onViewDetails, onAddToQueue, currentTeachingId, isPlaying, searchQuery }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<TeachingPlaylistType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };
  
  if (selectedPlaylist) {
    const filteredTeachings = selectedPlaylist.teachings.filter(teaching => {
        const query = searchQuery.toLowerCase();
        return (
            teaching.title.toLowerCase().includes(query) ||
            teaching.seriesName.toLowerCase().includes(query) ||
            (teaching.description && teaching.description.toLowerCase().includes(query))
        );
    });

    return (
      <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl h-full flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
           <div className="relative group">
                <button onClick={() => setSelectedPlaylist(null)} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><BackIcon className="w-5 h-5" /></button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Back</span>
           </div>
           <h2 className="text-lg md:text-xl font-semibold text-primary-400 dark:text-primary-300 truncate">{selectedPlaylist.name}</h2>
        </div>
        <div className="overflow-y-auto flex-grow">
          {selectedPlaylist.teachings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center p-8">This playlist is empty.</p>
          ) : filteredTeachings.length === 0 ? (
             <p className="text-gray-500 dark:text-gray-400 text-center p-8">No results found for "{searchQuery}".</p>
          ) : (
            <ul>
              {filteredTeachings.map(teaching => {
                const isCurrentlyPlaying = currentTeachingId === teaching.id && isPlaying;
                const isCurrentTeaching = currentTeachingId === teaching.id;

                return (
                  <li key={teaching.id} className={`flex items-center p-3 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 ${isCurrentTeaching ? 'bg-primary-500/10' : ''}`}>
                    <img src={teaching.coverArtUrl} alt={teaching.title} className="w-10 h-10 rounded-md mr-4 object-cover shrink-0" />
                    <div onClick={() => onViewDetails(teaching)} className="flex-grow min-w-0 cursor-pointer group">
                      <p className={`font-semibold truncate group-hover:underline text-base ${isCurrentTeaching ? 'text-primary-400' : 'text-gray-800 dark:text-gray-100'}`}>{teaching.title}</p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{teaching.seriesName}</p>
                    </div>
                    {isCurrentTeaching && <VolumeUpIcon className="w-5 h-5 text-primary-400 mr-4 animate-pulse" />}
                    <div className="flex items-center space-x-2">
                      <div className="relative group">
                          <button onClick={() => onPlay(teaching, filteredTeachings)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-primary-500 text-gray-700 dark:text-gray-200 hover:text-white" aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}>
                            {isCurrentlyPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">{isCurrentlyPlaying ? 'Pause' : 'Play'}</span>
                      </div>
                       <div className="relative group">
                            <button onClick={() => onAddToQueue(teaching)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-green-500 text-gray-700 dark:text-gray-200 hover:text-white" aria-label="Add to queue">
                                <QueuePlusIcon className="w-5 h-5" />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Add to Queue</span>
                        </div>
                      <div className="relative group">
                          <button onClick={() => onRemoveFromPlaylist(selectedPlaylist.id, teaching.id)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-500 text-gray-700 dark:text-gray-200 hover:text-white" aria-label="Remove from playlist">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Remove</span>
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
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold text-primary-400 dark:text-primary-300">My Teaching Playlists</h2>
        <div className="relative group">
            {!isCreating && <button onClick={() => setIsCreating(true)} className="text-sm bg-primary-500/80 hover:bg-primary-500 text-white dark:text-gray-900 font-bold py-1 px-3 rounded-full transition-colors">Create</button>}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">New playlist</span>
        </div>
      </div>
      <div className="overflow-y-auto flex-grow">
        {isCreating && (
            <form onSubmit={handleCreateSubmit} className="p-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <input type="text" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} placeholder="New playlist name..." autoFocus className="w-full px-3 py-1 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500" />
                <button type="submit" className="text-sm bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-3 rounded-lg">Save</button>
                <button type="button" onClick={() => setIsCreating(false)} className="text-sm bg-gray-500 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg">Cancel</button>
            </form>
        )}
        {playlists.length === 0 && !isCreating ? (
          <p className="text-gray-500 dark:text-gray-400 text-center p-8">No playlists created yet.</p>
        ) : (
          <ul>
            {playlists.map(p => (
              <li key={p.id} className="flex items-center p-3 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 group">
                <div onClick={() => setSelectedPlaylist(p)} className="flex-grow cursor-pointer">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{p.teachings.length} episode{p.teachings.length !== 1 && 's'}</p>
                </div>
                <div className="relative group/item">
                    <button onClick={() => onDeletePlaylist(p.id)} className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete playlist">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                    <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-20">Delete Playlist</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeachingPlaylist;
