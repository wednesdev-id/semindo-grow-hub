import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Settings, Rewind, FastForward } from 'lucide-react';

interface CustomYouTubePlayerProps {
    videoId: string;
    title?: string;
}

// YouTube IFrame Player API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export const CustomYouTubePlayer: React.FC<CustomYouTubePlayerProps> = ({ videoId, title }) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isReady, setIsReady] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [currentQuality, setCurrentQuality] = useState<string>('auto');
    const [availableQualities, setAvailableQualities] = useState<string[]>([]);
    const progressIntervalRef = useRef<number>();
    const feedbackTimeoutRef = useRef<number>();
    const hideControlsTimeoutRef = useRef<number>();

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            initializePlayer();
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            initializePlayer();
        };

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoId]);

    const initializePlayer = () => {
        if (!containerRef.current) return;

        playerRef.current = new window.YT.Player(containerRef.current, {
            videoId: videoId,
            playerVars: {
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                disablekb: 1,
                fs: 0,
                playsinline: 1,
                enablejsapi: 1,
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
    };

    const onPlayerReady = (event: any) => {
        setIsReady(true);
        setDuration(event.target.getDuration());
        setVolume(event.target.getVolume());

        // Get available quality levels
        const qualities = event.target.getAvailableQualityLevels();
        if (qualities && qualities.length > 0) {
            setAvailableQualities(qualities);
            setCurrentQuality(event.target.getPlaybackQuality());
        }
    };

    const onPlayerStateChange = (event: any) => {
        const playerState = event.data;

        if (playerState === 1) { // Playing
            setIsPlaying(true);
            setIsBuffering(false);
            startProgressTracking();
        } else if (playerState === 3) { // Buffering
            setIsBuffering(true);
        } else {
            setIsPlaying(false);
            setIsBuffering(false);
            stopProgressTracking();
        }
    };

    // Show feedback message
    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
        }
        feedbackTimeoutRef.current = window.setTimeout(() => {
            setFeedbackMessage('');
        }, 1000);
    };

    // Fullscreen detection
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Mouse movement tracking for auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);

        // Clear existing timeout
        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }

        // Set new timeout to hide controls after 3 seconds
        if (isPlaying) {
            hideControlsTimeoutRef.current = window.setTimeout(() => {
                setShowControls(false);
                setShowSettings(false);
            }, 3000);
        }
    };

    const startProgressTracking = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = window.setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 100);
    };

    const stopProgressTracking = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!playerRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = duration * percentage;
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const hoverX = e.clientX - rect.left;
        const percentage = hoverX / rect.width;
        setHoverTime(duration * percentage);
    };

    const toggleFullscreen = () => {
        // Use the player wrapper ref directly
        if (!playerWrapperRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            playerWrapperRef.current.requestFullscreen().catch(err => {
                console.error('Fullscreen error:', err);
            });
        }
    };

    const changePlaybackRate = (rate: number) => {
        if (!playerRef.current) return;
        playerRef.current.setPlaybackRate(rate);
        setPlaybackRate(rate);
        setShowSettings(false);
        showFeedback(`⚡ ${rate}x`);
    };

    const changeQuality = (quality: string) => {
        if (!playerRef.current) return;
        playerRef.current.setPlaybackQuality(quality);
        setCurrentQuality(quality);
        setShowSettings(false);
        showFeedback(`🎬 ${quality.toUpperCase()}`);
    };

    const seekRelative = (seconds: number) => {
        if (!playerRef.current || !duration) return;
        const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const adjustVolume = (delta: number) => {
        if (!playerRef.current) return;
        const newVolume = Math.max(0, Math.min(100, volume + delta));
        setVolume(newVolume);
        playerRef.current.setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const seekToPercentage = (percentage: number) => {
        if (!playerRef.current || !duration) return;
        const newTime = (duration * percentage) / 100;
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    // Keyboard shortcuts - placed after all function declarations
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!playerRef.current || !isReady) return;
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    showFeedback(isPlaying ? '⏸️ Paused' : '▶️ Playing');
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    seekRelative(-5);
                    showFeedback('⏪ -5s');
                    break;
                case 'arrowright':
                    e.preventDefault();
                    seekRelative(5);
                    showFeedback('⏩ +5s');
                    break;
                case 'j':
                    e.preventDefault();
                    seekRelative(-10);
                    showFeedback('⏪ -10s');
                    break;
                case 'l':
                    e.preventDefault();
                    seekRelative(10);
                    showFeedback('⏩ +10s');
                    break;
                case 'arrowup':
                    e.preventDefault();
                    adjustVolume(5);
                    showFeedback(`🔊 ${Math.min(100, volume + 5)}%`);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    adjustVolume(-5);
                    showFeedback(`🔉 ${Math.max(0, volume - 5)}%`);
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    showFeedback(isMuted ? '🔊 Unmuted' : '🔇 Muted');
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    e.preventDefault();
                    const percentage = parseInt(e.key) * 10;
                    seekToPercentage(percentage);
                    showFeedback(`⏭️ ${percentage}%`);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReady, isPlaying, volume, isMuted, currentTime, duration, togglePlay, toggleMute, toggleFullscreen, seekRelative, adjustVolume, seekToPercentage, showFeedback]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={playerWrapperRef}
            className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg relative group"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => {
                if (!isFullscreen) {
                    setShowControls(false);
                    setShowSettings(false);
                }
            }}
            onDoubleClick={toggleFullscreen}
        >
            {/* YouTube UI Block Overlays - Always rendered, shown/hidden via CSS */}
            {/* Block YouTube branding and UI elements */}
            <div className="pointer-events-none absolute inset-0 z-40">
                {/* Block Channel Avatar & Info (top-left area) */}
                <div
                    className="absolute top-2 left-2 w-32 h-16 bg-black/5"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />

                {/* Block Video Title Link (top area, center-left) */}
                <div
                    className="absolute top-2 left-36 w-64 h-12 bg-black/5"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />

                {/* Block Share & Info Buttons (top-right area) - expanded to cover all buttons */}
                <div
                    className="absolute top-2 right-8 w-40 h-12 bg-black/5"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />
            </div>

            {/* Fullscreen-specific overlays */}
            <div className={isFullscreen ? 'block' : 'hidden'}>
                {/* Block YouTube logo (top-right) */}
                <div
                    className="absolute top-3 right-3 w-24 h-12 bg-black/5 z-50"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />

                {/* Block "Watch on YouTube" link (bottom-center) */}
                <div
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/5 z-50"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />
            </div>

            {/* YouTube Player Container */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Loading/Buffering State */}
            {(!isReady || isBuffering) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-2" />
                        <p className="text-white font-medium">{isBuffering ? 'Buffering...' : 'Loading...'}</p>
                    </div>
                </div>
            )}

            {/* Feedback Toast */}
            {feedbackMessage && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-black/90 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl backdrop-blur-md border border-white/10">
                        {feedbackMessage}
                    </div>
                </div>
            )}

            {/* Custom Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                style={{ paddingTop: '100px' }}
            >
                {/* Progress Bar */}
                <div className="w-full px-4 mb-3">
                    <div
                        className="w-full h-1.5 bg-white/20 cursor-pointer hover:h-2 transition-all relative group/progress rounded-full overflow-hidden"
                        onClick={handleProgressClick}
                        onMouseMove={handleProgressHover}
                        onMouseLeave={() => setHoverTime(null)}
                    >
                        {/* Hover time preview */}
                        {hoverTime !== null && (
                            <div
                                className="absolute -top-10 left-0 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none backdrop-blur-md z-10"
                                style={{ left: `${(hoverTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}

                        <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all relative"
                            style={{ width: `${progressPercentage}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50 scale-0 group-hover/progress:scale-100 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-red-400 transition-all hover:scale-110 active:scale-95"
                            disabled={!isReady}
                        >
                            {isPlaying ? (
                                <Pause className="w-7 h-7" fill="currentColor" />
                            ) : (
                                <Play className="w-7 h-7" fill="currentColor" />
                            )}
                        </button>

                        {/* Skip buttons */}
                        <button
                            onClick={() => { seekRelative(-10); showFeedback('⏪ -10s'); }}
                            className="text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                        >
                            <Rewind className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => { seekRelative(10); showFeedback('⏩ +10s'); }}
                            className="text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                        >
                            <FastForward className="w-5 h-5" />
                        </button>

                        {/* Time Display */}
                        <div className="text-white text-sm font-medium tabular-nums">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        {/* Volume Controls */}
                        <div className="flex items-center gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="text-white/80 hover:text-white transition-all hover:scale-110"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:shadow-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Settings (Quality & Speed) */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`text-white/80 hover:text-white transition-all hover:scale-110 p-2 rounded-lg ${showSettings ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden min-w-[200px] border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {/* Quality Section */}
                                    {availableQualities.length > 0 && (
                                        <div className="border-b border-white/10">
                                            <div className="px-4 py-3 bg-white/5">
                                                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Quality
                                                </h3>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto py-1">
                                                {availableQualities.map(quality => {
                                                    const qualityLabels: Record<string, string> = {
                                                        'auto': 'Auto',
                                                        'tiny': '144p',
                                                        'small': '240p',
                                                        'medium': '360p',
                                                        'large': '480p',
                                                        'hd720': '720p HD',
                                                        'hd1080': '1080p Full HD',
                                                        'highres': '1440p+',
                                                    };
                                                    const label = qualityLabels[quality] || quality.toUpperCase();

                                                    return (
                                                        <button
                                                            key={quality}
                                                            onClick={() => changeQuality(quality)}
                                                            className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between group ${currentQuality === quality
                                                                    ? 'text-red-400 bg-red-500/20 font-medium'
                                                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                        >
                                                            <span>{label}</span>
                                                            {currentQuality === quality && (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Speed Section */}
                                    <div>
                                        <div className="px-4 py-3 bg-white/5">
                                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Playback Speed
                                            </h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto py-1">
                                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                                                <button
                                                    key={rate}
                                                    onClick={() => changePlaybackRate(rate)}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between group ${playbackRate === rate
                                                            ? 'text-red-400 bg-red-500/20 font-medium'
                                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <span>{rate}x {rate === 1 && '(Normal)'}</span>
                                                    {playbackRate === rate && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        {title && (
                            <div className="text-white/90 text-sm font-medium max-w-xs truncate hidden md:block">
                                {title}
                            </div>
                        )}

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                        >
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Play Button (when paused) */}
            {!isPlaying && isReady && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
                    onClick={togglePlay}
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-600 transition-all shadow-2xl shadow-red-500/50 group-hover/play:scale-110 group-active/play:scale-95">
                        <Play className="w-12 h-12 text-white ml-2" fill="currentColor" />
                    </div>
                </div>
            )}
        </div>
    );
};
