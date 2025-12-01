import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onComplete?: () => void;
    className?: string;
}

export default function VideoPlayer({ src, poster, onComplete, className }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((current / duration) * 100);

            if (current === duration && onComplete) {
                onComplete();
            }
        }
    };

    const handleProgressChange = (value: number[]) => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            videoRef.current.currentTime = (value[0] / 100) * duration;
            setProgress(value[0]);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        if (videoRef.current) {
            videoRef.current.volume = value[0];
            setVolume(value[0]);
            setIsMuted(value[0] === 0);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current?.parentElement?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className={cn("relative group bg-black rounded-lg overflow-hidden aspect-video", className)}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity opacity-0 group-hover:opacity-100">
                <div className="flex flex-col gap-2">
                    <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        onValueChange={handleProgressChange}
                        className="cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:text-primary transition-colors">
                                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>

                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="hover:text-primary transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={1}
                                        step={0.1}
                                        onValueChange={handleVolumeChange}
                                        className="w-20"
                                    />
                                </div>
                            </div>
                        </div>

                        <button onClick={toggleFullscreen} className="hover:text-primary transition-colors">
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm">
                        <Play size={48} className="text-white fill-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
}
