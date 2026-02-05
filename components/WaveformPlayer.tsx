"use client";

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaveformPlayerProps {
    audioUrl: string | Blob;
    onTimeUpdate?: (currentTime: number) => void;
    height?: number;
    waveColor?: string;
    progressColor?: string;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
    audioUrl,
    onTimeUpdate,
    height = 64,
    waveColor = '#4f46e5', // Primary blue-ish
    progressColor = '#818cf8' // Lighter blue
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Use a ref for the callback to prevent effect re-triggering when the parent passes a new function
    const onTimeUpdateRef = useRef(onTimeUpdate);

    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate;
    }, [onTimeUpdate]);

    useEffect(() => {
        if (!containerRef.current) return;

        const url = typeof audioUrl === 'string' ? audioUrl : URL.createObjectURL(audioUrl);

        wavesurfer.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: waveColor,
            progressColor: progressColor,
            height: height,
            cursorColor: 'transparent',
            barWidth: 2,
            barGap: 3,
            normalize: true,
        });

        // Load audio and handle potential abort errors during rapid unmounts
        wavesurfer.current.load(url).catch((err) => {
            // Ignore abort errors which happen during cleanup
            if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                return;
            }
            console.error('WaveSurfer load error:', err);
            setIsLoading(false);
        });

        wavesurfer.current.on('ready', () => {
            setIsLoading(false);
            setDuration(wavesurfer.current?.getDuration() || 0);
        });

        wavesurfer.current.on('play', () => setIsPlaying(true));
        wavesurfer.current.on('pause', () => setIsPlaying(false));
        wavesurfer.current.on('timeupdate', (time) => {
            setCurrentTime(time);
            if (onTimeUpdateRef.current) onTimeUpdateRef.current(time);
        });

        wavesurfer.current.on('interaction', (time) => {
            setCurrentTime(time);
            if (onTimeUpdateRef.current) onTimeUpdateRef.current(time);
        });

        return () => {
            if (wavesurfer.current) {
                try {
                    wavesurfer.current.destroy();
                } catch (e) {
                    console.debug("WaveSurfer cleanup error:", e);
                }
                wavesurfer.current = null;
            }

            if (typeof audioUrl !== 'string') {
                URL.revokeObjectURL(url);
            }
        };
    }, [audioUrl, height, waveColor, progressColor]); // Removed onTimeUpdate from dependencies

    const togglePlay = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 w-full bg-secondary/30 p-4 rounded-lg border border-border/30">
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                onClick={togglePlay}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                    <Pause className="h-5 w-5" />
                ) : (
                    <Play className="h-5 w-5 pl-0.5" />
                )}
            </Button>

            <div className="flex-1 space-y-1">
                <div ref={containerRef} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};
