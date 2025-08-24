
import React, { useEffect, useRef, useState, useMemo } from 'react';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import type { YouTubePlaylistItem } from '../types';

// Declare YT and YT.Player types for TypeScript
declare global {
  interface Window { onYouTubeIframeAPIReady: () => void; YT: any; }
}

interface YouTubeViewProps {
  searchQuery: string;
  playlistId: string;
  showChat?: boolean;
  viewId: string;
  setPlayingView: (viewId: string | null) => void;
  playingView: string | null;
}

const YouTubeView: React.FC<YouTubeViewProps> = ({ searchQuery, playlistId, showChat, viewId, setPlayingView, playingView }) => {
    const playerRef = useRef<any>(null);
    const videoDataRef = useRef<YouTubePlaylistItem[]>([]);
    
    const propsRef = useRef({ setPlayingView, playingView, viewId });
    propsRef.current = { setPlayingView, playingView, viewId };

    const [videos, setVideos] = useState<YouTubePlaylistItem[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const playerId = useMemo(() => `youtube-player-${playlistId || Math.random().toString(36).substring(7)}`, [playlistId]);

    const embedDomain = useMemo(() => {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.hostname;
        }
        return '';
    }, []);

    const loadYouTubeApi = (callback: () => void) => {
        if (window.YT && window.YT.Player) {
            callback();
        } else {
            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                 const tag = document.createElement('script');
                 tag.src = "https://www.youtube.com/iframe_api";
                 const firstScriptTag = document.getElementsByTagName('script')[0];
                 firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
            }
            window.onYouTubeIframeAPIReady = callback;
        }
    };

    useEffect(() => {
        const onPlayerStateChange = (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
                propsRef.current.setPlayingView(propsRef.current.viewId);
                setTimeout(() => {
                    const currentVideoIndex = event.target.getPlaylistIndex();
                    if (videoDataRef.current[currentVideoIndex]) {
                        const currentVideoId = videoDataRef.current[currentVideoIndex].snippet.resourceId.videoId;
                        setActiveVideoId(currentVideoId);
                    }
                }, 200);
            } else if ([
                window.YT.PlayerState.ENDED,
                window.YT.PlayerState.PAUSED,
                window.YT.PlayerState.CUED,
                -1 // UNSTARTED
            ].includes(event.data)) {
                if (propsRef.current.playingView === propsRef.current.viewId) {
                    propsRef.current.setPlayingView(null);
                }
            }
        };

        const initializePlayerWithPlaylistId = () => {
            const onPlayerReady = async (event: any) => {
                try {
                    const player = event.target;
                    const videoIds = player.getPlaylist();

                    if (!videoIds || videoIds.length === 0) {
                        setError("This playlist is empty, private, or could not be found.");
                        setIsLoading(false);
                        return;
                    }
                    
                    if(videoIds.length > 0) {
                        setActiveVideoId(videoIds[0]);
                    }

                    const videoDetailsPromises = videoIds.map((videoId: string) => 
                        fetch(`https://www.youtube-nocookie.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                            .then(res => res.ok ? res.json() : null)
                            .then(data => data ? ({ videoId, ...data }) : null)
                            .catch(() => null)
                    );

                    const videoDetailsResults = await Promise.all(videoDetailsPromises);
                    const validVideoDetails = videoDetailsResults.filter(detail => detail !== null);
                    
                    const playlistItems: YouTubePlaylistItem[] = validVideoDetails.map((detail: any, index) => ({
                        id: `${detail.videoId}-${index}`,
                        snippet: {
                            title: detail.title || 'Video Title Unavailable',
                            description: '',
                            publishedAt: '',
                            thumbnails: {
                                default: { url: detail.thumbnail_url, width: 120, height: 90 },
                                medium: { url: detail.thumbnail_url, width: 320, height: 180 },
                                high: { url: detail.thumbnail_url, width: 480, height: 360 },
                            },
                            resourceId: { videoId: detail.videoId },
                            position: index,
                        },
                    }));
                    
                    if (playlistItems.length === 0 && videoIds.length > 0) {
                        setError("Could not load details for videos in this playlist. They may be private or unavailable.");
                    }

                    videoDataRef.current = playlistItems;
                    setVideos(playlistItems);
                    setIsLoading(false);
                } catch (err: any) {
                    console.error("Error processing playlist:", err);
                    setError("An error occurred while loading video details.");
                    setIsLoading(false);
                }
            };

            const createPlayer = () => {
                if (document.getElementById(playerId) && !playerRef.current) {
                    playerRef.current = new window.YT.Player(playerId, {
                        height: '100%',
                        width: '100%',
                        playerVars: { listType: 'playlist', list: playlistId, playsinline: 1, rel: 0 },
                        events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange },
                    });
                }
            };
            loadYouTubeApi(createPlayer);
        };

        const cleanup = () => {
            if (propsRef.current.playingView === propsRef.current.viewId) {
                propsRef.current.setPlayingView(null);
            }
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
            if (window.onYouTubeIframeAPIReady) {
                 window.onYouTubeIframeAPIReady = () => {};
            }
        };

        cleanup();
        setIsLoading(true);
        setError(null);
        setVideos([]);
        setActiveVideoId(null);
        videoDataRef.current = [];

        if (!playlistId) {
            setIsLoading(false);
            setError("No YouTube Playlist ID has been configured for this section. An administrator can add one in Site Settings.");
            return;
        }

        initializePlayerWithPlaylistId();

        return cleanup;
    }, [playlistId, playerId]);


    const handleVideoSelect = (videoId: string) => {
        const videoIndex = videos.findIndex(v => v.snippet.resourceId.videoId === videoId);
        if (videoIndex !== -1 && playerRef.current && typeof playerRef.current.playVideoAt === 'function') {
            playerRef.current.playVideoAt(videoIndex);
            setActiveVideoId(videoId);
        }
    };
    
    const filteredVideos = useMemo(() => {
        if (!searchQuery) return videos;
        return videos.filter(video => video.snippet.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [videos, searchQuery]);

    const activeVideo = videos.find(v => v.snippet.resourceId.videoId === activeVideoId)?.snippet;
    
    const chatSrc = useMemo(() => (showChat && activeVideoId)
        ? `https://www.youtube.com/live_chat?v=${activeVideoId}&embed_domain=${embedDomain}`
        : '', [showChat, activeVideoId, embedDomain]);

    return (
        <div className={`grid grid-cols-1 ${showChat ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 lg:h-full`}>
            {/* Main Player */}
            <div className="lg:col-span-2 flex flex-col">
                <div className="w-full aspect-video rounded-lg shadow-2xl overflow-hidden border-4 border-gray-300 dark:border-gray-700 bg-black">
                   <div id={playerId} className="w-full h-full"></div>
                </div>
                 {activeVideo && (
                    <div className="mt-4 text-left">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">{activeVideo.title}</h2>
                        {activeVideo.description && 
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 whitespace-pre-wrap">{activeVideo.description.substring(0, 200)}{activeVideo.description.length > 200 ? '...' : ''}</p>
                        }
                    </div>
                 )}
            </div>

            {/* Live Chat (Conditional) */}
            {showChat && (
                <div className="lg:col-span-1 flex flex-col h-[60vh] lg:h-full">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-left">Live Chat</h3>
                     <div className="flex-grow rounded-lg shadow-2xl overflow-hidden border-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                         {chatSrc ? (
                             <iframe
                                 key={`${activeVideoId}-chat`}
                                 className="w-full h-full"
                                 src={chatSrc}
                                 title="Live Chat"
                                 frameBorder="0"
                                 allow="autoplay; encrypted-media; fullscreen"
                             ></iframe>
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
                                <p>Chat is available when a video is playing.</p>
                            </div>
                         )}
                     </div>
                </div>
            )}


            {/* Playlist */}
            <div className="lg:col-span-1 flex flex-col bg-white dark:bg-gray-800/50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold p-3 border-b border-gray-200 dark:border-gray-700 text-primary-400">Playlist Videos ({isLoading ? '...' : filteredVideos.length})</h3>
                <div className="overflow-y-auto flex-grow">
                     {isLoading ? (
                        <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 animate-spin text-primary-400" /></div>
                    ) : error ? (
                        <div className="p-4 text-red-700 dark:text-red-300">{error}</div>
                    ) : filteredVideos.length === 0 ? (
                        <div className="p-4 text-gray-500 dark:text-gray-400">No videos found{searchQuery && ` for "${searchQuery}"`}.</div>
                    ) : (
                    <ul>
                        {filteredVideos.map(video => (
                            <li key={video.id}>
                                <button onClick={() => handleVideoSelect(video.snippet.resourceId.videoId)} className={`w-full flex items-center p-2 gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${activeVideoId === video.snippet.resourceId.videoId ? 'bg-primary-500/10' : ''}`}>
                                    <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} className="w-24 h-14 object-cover rounded-md flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold line-clamp-2 ${activeVideoId === video.snippet.resourceId.videoId ? 'text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {video.snippet.title}
                                        </p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YouTubeView;
