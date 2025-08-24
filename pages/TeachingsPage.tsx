
import React, { useState } from 'react';
import YouTubeView from './YouTubeView';
import RssIcon from '../components/icons/RssIcon';
import YouTubeIcon from '../components/icons/YouTubeIcon';
import { useTheme } from '../context/ThemeContext';
import VideoCameraIcon from '../components/icons/VideoCameraIcon';
import BroadcastIcon from '../components/icons/BroadcastIcon';
import SearchIcon from '../components/icons/SearchIcon';
import XIcon from '../components/icons/XIcon';
import GlobalSearchView from '../components/GlobalSearchView';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';

interface TeachingsPageProps {
    setPlayingView: (viewId: string | null) => void;
    playingView: string | null;
}

type TeachingTab = 'audio' | 'deep-dives' | 'seekers-sabbath' | 'hebrew-mind';

const TeachingsPage: React.FC<TeachingsPageProps> = ({ setPlayingView, playingView }) => {
  const [activeTab, setActiveTab] = useState<TeachingTab>('audio');
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: TeachingTab; label: string; icon: React.FC<any>; playlistId: string; showChat?: boolean }[] = [
    { id: 'audio', label: 'Audio Library', icon: RssIcon, playlistId: theme.youtubePlaylistIdAudio },
    { id: 'deep-dives', label: 'Deep Dives', icon: VideoCameraIcon, playlistId: theme.youtubePlaylistIdDeepDives },
    { id: 'seekers-sabbath', label: "Seeker's Sabbath Live", icon: BroadcastIcon, playlistId: theme.youtubePlaylistIdSeekersSabbath, showChat: true },
    { id: 'hebrew-mind', label: 'Restoring the Hebrew Mind', icon: YouTubeIcon, playlistId: theme.youtubePlaylistIdHebrewMind, showChat: true },
  ];
  
  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 pt-4">
        <div className="relative w-full max-w-lg mx-auto mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder="Search all teachings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 group" aria-label="Clear search">
                    <XIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                </button>
            )}
        </div>
        {!showSearchResults && (
          <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map(tab => {
              const viewId = `teachings-${tab.id}`;
              const isPlaying = playingView === viewId;
              return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium transition-colors flex-shrink-0 ${activeTab === tab.id ? 'border-b-2 border-primary-400 text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {isPlaying && <SpeakerWaveIcon className="w-4 h-4 text-primary-400 ml-2 animate-pulse" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex-grow relative">
        {showSearchResults ? (
            <div className="p-4 lg:p-8 h-full">
                <GlobalSearchView searchQuery={searchQuery} />
            </div>
        ) : (
            tabs.map(tab => (
                <div 
                    key={tab.id}
                    className={`absolute inset-0 overflow-y-auto ${activeTab === tab.id ? 'visible' : 'invisible'}`}
                    aria-hidden={activeTab !== tab.id}
                >
                    <div className="p-4 lg:p-8 lg:h-full">
                        <YouTubeView 
                            searchQuery={searchQuery} 
                            playlistId={tab.playlistId}
                            showChat={tab.showChat}
                            viewId={`teachings-${tab.id}`}
                            playingView={playingView}
                            setPlayingView={setPlayingView}
                        />
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default TeachingsPage;
