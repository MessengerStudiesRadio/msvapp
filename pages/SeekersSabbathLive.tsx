import React, { useState } from 'react';
import type { Teaching, TeachingPlaylist as TeachingPlaylistType } from '../types';
import TeachingLibrary from '../components/TeachingLibrary';
import TeachingPlaylist from '../components/TeachingPlaylist';
import YouTubeView from './YouTubeView';
import RssIcon from '../components/icons/RssIcon';
import YouTubeIcon from '../components/icons/YouTubeIcon';
import { useTheme } from '../context/ThemeContext';

interface SeekersSabbathLiveProps {
  teachingCatalog: Teaching[];
  handlePlayTeaching: (teaching: Teaching, queue: Teaching[]) => void;
  setTeachingToAdd: (teaching: Teaching | null) => void;
  setDetailItem: (teaching: Teaching | null) => void;
  handleAddToQueue: (teaching: Teaching) => void;
  currentItemId: number | null | undefined;
  isPlaying: boolean;
  searchQuery: string;
  teachingPlaylists: TeachingPlaylistType[];
  handleRemoveFromTeachingPlaylist: (playlistId: number, teachingId: number) => void;
  handleCreateTeachingPlaylist: (name: string) => void;
  handleDeleteTeachingPlaylist: (playlistId: number) => void;
  setPlayingView: (viewId: string | null) => void;
  playingView: string | null;
}

const SeekersSabbathLive: React.FC<SeekersSabbathLiveProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');
  const { theme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8">
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'audio' ? 'border-b-2 border-primary-400 text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <RssIcon className="w-5 h-5" />
            <span>Audio Library</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'video' ? 'border-b-2 border-primary-400 text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <YouTubeIcon className="w-5 h-5" />
            <span>Video Playlist</span>
          </button>
        </div>
      </div>

      {activeTab === 'audio' && (
        <div className="p-4 lg:p-8 flex-grow overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="flex-1 lg:w-1/2">
                    <TeachingLibrary 
                        teachings={props.teachingCatalog} 
                        onPlay={props.handlePlayTeaching} 
                        onSelectTeachingToAdd={props.setTeachingToAdd} 
                        onViewDetails={props.setDetailItem} 
                        onAddToQueue={props.handleAddToQueue} 
                        currentTeachingId={props.currentItemId} 
                        isPlaying={props.isPlaying} 
                        searchQuery={props.searchQuery} 
                    />
                </div>
                <div className="flex-1 lg:w-1/2">
                    <TeachingPlaylist 
                        playlists={props.teachingPlaylists} 
                        onPlay={props.handlePlayTeaching} 
                        onRemoveFromPlaylist={props.handleRemoveFromTeachingPlaylist} 
                        onCreatePlaylist={props.handleCreateTeachingPlaylist} 
                        onDeletePlaylist={props.handleDeleteTeachingPlaylist} 
                        onViewDetails={props.setDetailItem} 
                        onAddToQueue={props.handleAddToQueue} 
                        currentTeachingId={props.currentItemId} 
                        isPlaying={props.isPlaying} 
                        searchQuery={props.searchQuery}
                    />
                </div>
            </div>
        </div>
      )}
      {activeTab === 'video' && (
        <div className="p-4 lg:p-8 flex-grow overflow-y-auto">
            <YouTubeView 
                searchQuery={props.searchQuery} 
                playlistId={theme.youtubePlaylistIdSeekersSabbath} 
                viewId="seekers-sabbath-video"
                setPlayingView={props.setPlayingView}
                playingView={props.playingView}
                showChat={true}
            />
        </div>
      )}
    </div>
  );
};

export default SeekersSabbathLive;