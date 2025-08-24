
import React, { useEffect, useRef, useState, useMemo } from 'react';
import SpinnerIcon from './icons/SpinnerIcon';
import { useTheme } from '../context/ThemeContext';
import type { YouTubePlaylistItem } from '../types';

declare global {
  interface Window { onYouTubeIframeAPIReady: () => void; YT: any; }
}

let apiPromise: Promise<void> | null = null;
const loadYouTubeApi = (): Promise<void> => {
    if (apiPromise) {
        return apiPromise;
    }
    apiPromise = new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) {
            return resolve();
        }
        window.onYouTubeIframeAPIReady = () => resolve();
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
             const tag = document.createElement('script');
             tag.src = "https://www.youtube.com/iframe_api";
             document.head.appendChild(tag);
        }
    });
    return apiPromise;
};

const fetchPlaylistData = (playlistId: string): Promise<YouTubePlaylistItem[]> => {
    return new Promise(async (resolve, reject) => {
        if (!playlistId) {
            return resolve([]);
        }

        await loadYouTubeApi();
        
        let player: any;
        const tempPlayerId = `temp-player-${playlistId}-${Math.random().toString(36).substring(7)}`;
        const tempDiv = document.createElement('div');
        tempDiv.id = tempPlayerId;
        tempDiv.style.cssText = 'position: absolute; top: -9999px; left: -9999px;';
        document.body.appendChild(tempDiv);
        
        const cleanup = () => {
            if (player && typeof player.destroy === 'function') {
                player.destroy();
            }
            if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
            }
        };

        const timer = setTimeout(() => {
            cleanup();
            console.warn(`Timeout fetching data for playlist ${playlistId}`);
            resolve([]); // Resolve with empty array on timeout
        }, 20000); // 20-second timeout per playlist

        player = new window.YT.Player(tempPlayerId, {
            events: {
                'onReady': async (event: any) => {
                    try {
                        const videoIds = event.target.getPlaylist();
                        if (!videoIds || videoIds.length === 0) {
                            resolve([]);
                            return;
                        }

                        const detailsPromises = videoIds.map((videoId: string) =>
                            fetch(`https://www.youtube-nocookie.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                                .then(res => res.ok ? res.json() : null)
                                .then(data => data ? { videoId, ...data } : null)
                                .catch(() => null)
                        );
                        
                        const results = await Promise.all(detailsPromises);
                        const items: YouTubePlaylistItem[] = results
                            .filter((d): d is any => d !== null)
                            .map((detail, index) => ({
                                id: `${detail.videoId}-${index}`,
                                snippet: {
                                    title: detail.title || 'Video Title Unavailable',
                                    description: '', publishedAt: '',
                                    thumbnails: {
                                        default: { url: detail.thumbnail_url, width: 120, height: 90 },
                                        medium: { url: detail.thumbnail_url, width: 320, height: 180 },
                                        high: { url: detail.thumbnail_url, width: 480, height: 360 },
                                    },
                                    resourceId: { videoId: detail.videoId },
                                    position: index,
                                },
                            }));
                        resolve(items);
                    } catch (e) {
                        reject(e);
                    } finally {
                        clearTimeout(timer);
                        cleanup();
                    }
                },
                'onError': (e: any) => {
                    console.error(`YT Player Error for ${playlistId}:`, e.data);
                    reject(new Error(`YouTube Player error ${e.data}`));
                    clearTimeout(timer);
                    cleanup();
                }
            },
            playerVars: { listType: 'playlist', list: playlistId }
        });
    });
};


const GlobalSearchView: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
    const { theme } = useTheme();
    const playerRef = useRef<any>(null);
    const videoDataRef = useRef<YouTubePlaylistItem[]>([]);
    
    const [videos, setVideos] = useState<YouTubePlaylistItem[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const playerId = 'global-search-player';

    useEffect(() => {
        let isMounted = true;
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);

            const playlistIds = [
                theme.youtubePlaylistIdAudio,
                theme.youtubePlaylistIdDeepDives,
                theme.youtubePlaylistIdSeekersSabbath,
                theme.youtubePlaylistIdHebrewMind,
            ].filter(id => id);

            try {
                const results = await Promise.all(playlistIds.map(id => fetchPlaylistData(id)));
                if (!isMounted) return;

                const allVideosRaw = results.flat();
                const uniqueVideos = Array.from(new Map(allVideosRaw.map(v => [v.snippet.resourceId.videoId, v])).values());
                const filtered = uniqueVideos.filter(v => v.snippet.title.toLowerCase().includes(searchQuery.toLowerCase()));
                
                setVideos(filtered);
                videoDataRef.current = filtered;

            } catch (err: any) {
                console.error("Error fetching all playlist data:", err);
                if (isMounted) setError("Failed to load search results. Please try again.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAllData();

        return () => {
            isMounted = false;
        };
    }, [searchQuery, theme]);

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.CUED) {
             setTimeout(() => {
                const currentVideoIndex = event.target.getPlaylistIndex();
                if (videoDataRef.current[currentVideoIndex]) {
                    const currentVideoId = videoDataRef.current[currentVideoIndex].snippet.resourceId.videoId;
                    setActiveVideoId(currentVideoId);
                }
             }, 200);
        }
    };
    
    useEffect(() => {
        if (videos.length > 0 && !playerRef.current) {
            const videoIds = videos.map(v => v.snippet.resourceId.videoId);
            loadYouTubeApi().then(() => {
                if(document.getElementById(playerId)) {
                    playerRef.current = new window.YT.Player(playerId, {
                        height: '100%',
                        width: '100%',
                        playerVars: { playsinline: 1, rel: 0 },
                        events: {
                            'onReady': (event: any) => {
                                event.target.cuePlaylist(videoIds);
                                if (videoIds.length > 0) setActiveVideoId(videoIds[0]);
                            },
                            'onStateChange': onPlayerStateChange,
                        }
                    });
                }
            });
        }
        
        return () => {
             if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        }
    }, [videos]);

    const handleVideoSelect = (videoId: string) => {
        const videoIndex = videos.findIndex(v => v.snippet.resourceId.videoId === videoId);
        if (videoIndex !== -1 && playerRef.current && typeof playerRef.current.playVideoAt === 'function') {
            playerRef.current.playVideoAt(videoIndex);
            setActiveVideoId(videoId);
        }
    };
    
    const activeVideo = videos.find(v => v.snippet.resourceId.videoId === activeVideoId)?.snippet;

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 animate-spin text-primary-400 mr-2" /> Searching all teachings...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-700 dark:text-red-300 text-center">{error}</div>;
    }
    if (videos.length === 0) {
        return <div className="p-4 text-gray-500 dark:text-gray-400 text-center">No results found for "{searchQuery}" across all teachings.</div>;
    }

    return (
        <div className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-3 lg:grid-rows-1 gap-8 h-full">
            <div className="lg:col-span-2 flex flex-col">
                <div className="w-full aspect-video rounded-lg shadow-2xl overflow-hidden border-4 border-gray-300 dark:border-gray-700 bg-black">
                   <div id={playerId} className="w-full h-full"></div>
                </div>
                 {activeVideo && (
                    <div className="mt-4 text-left">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">{activeVideo.title}</h2>
                    </div>
                 )}
            </div>

            <div className="lg:col-span-1 flex flex-col bg-white dark:bg-gray-800/50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-0">
                <h3 className="text-lg font-semibold p-3 border-b border-gray-200 dark:border-gray-700 text-primary-400 flex-shrink-0">Search Results ({videos.length})</h3>
                <div className="overflow-y-auto flex-grow">
                    <ul>
                        {videos.map(video => (
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
                </div>
            </div>
        </div>
    );
};

export default GlobalSearchView;
