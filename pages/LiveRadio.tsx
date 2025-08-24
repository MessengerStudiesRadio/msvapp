
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import InfoIcon from '../components/icons/InfoIcon';

interface ConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirm }) => (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
    >
        <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-red-500/50"
        >
            <div className="p-6 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 id="confirm-title" className="text-xl font-bold text-gray-900 dark:text-white">Are you absolutely sure?</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    This action is irreversible. It will permanently delete <strong>all local data</strong>, including user accounts, saved studies, and completed readings. You will be logged out and the app will reset to its default state.
                </p>
                 <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-500/30 text-left flex items-start gap-3">
                    <InfoIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Why refresh?</strong><br/>
                        This action ensures you receive the latest app additions and upgrades. It will not harm your device.
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                <button 
                    onClick={onClose} 
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm} 
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                    Confirm Refresh
                </button>
            </div>
        </div>
    </div>
);

interface LiveRadioProps {
    setPlayingView: (viewId: string | null) => void;
    playingView: string | null;
}


const LiveRadio: React.FC<LiveRadioProps> = ({ setPlayingView, playingView }) => {
    const { theme } = useTheme();
    const liveVideoId = theme.liveStreamVideoId;
    const playerRef = useRef<any>(null);
    const [streamError, setStreamError] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    const propsRef = useRef({ setPlayingView, playingView });
    propsRef.current = { setPlayingView, playingView };
    const viewId = 'live-radio';

    const playerId = 'youtube-live-player';
    
    const embedDomain = useMemo(() => {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.hostname;
        }
        return '';
    }, []);
    
    const handleConfirmRefresh = () => {
        localStorage.removeItem('msr_users');
        localStorage.removeItem('msr_study_outlines');
        localStorage.removeItem('msr_completed_readings_daily');
        localStorage.removeItem('app-theme-settings');
        localStorage.removeItem('app-theme-logo');
        localStorage.removeItem('msr_teaching_playlists');
        localStorage.removeItem('msr_teaching_catalog');
        window.location.reload();
    };
    
    useEffect(() => {
        const onStateChange = (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
                propsRef.current.setPlayingView(viewId);
            } else if ([
                window.YT.PlayerState.ENDED, 
                window.YT.PlayerState.PAUSED, 
                window.YT.PlayerState.CUED,
                -1 // UNSTARTED
            ].includes(event.data)) {
                if (propsRef.current.playingView === viewId) {
                    propsRef.current.setPlayingView(null);
                }
            }
        };

        const onError = (event: any) => {
            if ([2, 5, 100, 101, 150].includes(event.data)) {
                setStreamError(true);
            }
            if (propsRef.current.playingView === viewId) {
                propsRef.current.setPlayingView(null);
            }
        };

        const createPlayer = () => {
            if (document.getElementById(playerId) && !playerRef.current && liveVideoId) {
                try {
                    playerRef.current = new window.YT.Player(playerId, {
                        height: '100%',
                        width: '100%',
                        videoId: liveVideoId,
                        playerVars: { autoplay: 1, rel: 0, origin: window.location.origin },
                        events: { 'onStateChange': onStateChange, 'onError': onError },
                    });
                } catch (e) {
                    console.error("Failed to create YouTube player:", e);
                }
            }
        };
        
        if (liveVideoId) {
            if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
                const existingApiReady = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (existingApiReady) existingApiReady();
                    createPlayer();
                };
            } else {
                createPlayer();
            }
        }

        return () => {
            if (propsRef.current.playingView === viewId) {
                propsRef.current.setPlayingView(null);
            }
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [liveVideoId]);

    const chatSrc = useMemo(() => liveVideoId 
        ? `https://www.youtube.com/live_chat?v=${liveVideoId}&embed_domain=${embedDomain}`
        : '', [liveVideoId, embedDomain]);
        
    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="text-center mb-4 lg:mb-8 flex-shrink-0">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">MSR Live Radio 24/7</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Sacred Name Worship Music & Teachings</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow min-h-0">
                <div className="lg:col-span-2 flex flex-col">
                    <div className="w-full aspect-video rounded-lg shadow-2xl overflow-hidden border-4 border-gray-300 dark:border-gray-700 bg-black">
                        {!liveVideoId ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400 p-4 text-center">
                                <p>No live stream video ID has been set. An administrator can set one in Site Settings.</p>
                            </div>
                        ) : (
                             <div id={playerId} className="w-full h-full"></div>
                        )}
                    </div>
                     {streamError && (
                        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg text-center">
                            <div className="flex items-center justify-center gap-3">
                                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">Stream Unavailable</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        The stream may be offline or the link has changed.
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                To get the latest update from the site administrator, please refresh the app.
                            </p>
                            <button
                                onClick={() => setIsConfirmModalOpen(true)}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-primary-400 transition-colors shadow-md"
                            >
                                Refresh App
                            </button>
                        </div>
                    )}
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Stream not working?{' '}
                            <button 
                                onClick={() => setIsConfirmModalOpen(true)}
                                className="font-semibold text-primary-500 hover:underline focus:outline-none"
                            >
                                Click here to refresh.
                            </button>
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col mt-8 lg:mt-0 h-[60vh] lg:h-full">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-left">Live Chat</h3>
                     <div className="flex-grow rounded-lg shadow-2xl overflow-hidden border-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                         {liveVideoId && !streamError ? (
                             <iframe
                                 key={`${liveVideoId}-chat`}
                                 className="w-full h-full"
                                 src={chatSrc}
                                 title="Live Chat"
                                 frameBorder="0"
                                 allow="autoplay; encrypted-media; fullscreen"
                             ></iframe>
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
                                <p>Chat is unavailable.</p>
                            </div>
                         )}
                     </div>
                </div>
            </div>

            {isConfirmModalOpen && (
                <ConfirmationModal 
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmRefresh}
                />
            )}
        </div>
    );
};

export default LiveRadio;
