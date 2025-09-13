import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isActive: boolean;
  audioLevel: number;
  className?: string;
  barCount?: number;
  color?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  audioLevel,
  className,
  barCount = 40,
  color = 'bg-primary'
}) => {
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(barCount).fill(0));
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isActive) {
      const updateLevels = () => {
        setAudioLevels(prev => {
          const newLevels = [...prev];
          
          // Add some randomness to create a more natural waveform
          for (let i = 0; i < barCount; i++) {
            const baseLevel = audioLevel;
            const randomFactor = 0.3 + Math.random() * 0.7;
            const positionFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
            
            newLevels[i] = Math.min(1, baseLevel * randomFactor * positionFactor);
          }
          
          return newLevels;
        });
        
        animationRef.current = requestAnimationFrame(updateLevels);
      };
      
      updateLevels();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevels(new Array(barCount).fill(0));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioLevel, barCount]);

  return (
    <div className={cn("flex items-center justify-center gap-1 h-20", className)}>
      {audioLevels.map((level, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full transition-all duration-75",
            color,
            isActive && "animate-pulse"
          )}
          style={{
            width: '4px',
            height: `${Math.max(4, level * 100)}px`,
            animationDelay: `${index * 20}ms`,
            opacity: isActive ? 0.7 + level * 0.3 : 0.3
          }}
        />
      ))}
    </div>
  );
};

interface CircularVisualizerProps {
  isActive: boolean;
  audioLevel: number;
  className?: string;
  size?: number;
}

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({
  isActive,
  audioLevel,
  className,
  size = 200
}) => {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isActive) {
      const animate = () => {
        setRotation(prev => (prev + 1) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;
  const points = 16;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <radialGradient id="audioGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        {Array.from({ length: points }, (_, i) => {
          const angle = (i * 360 / points + rotation) * (Math.PI / 180);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const level = isActive ? audioLevel * (0.5 + Math.random() * 0.5) : 0;
          const radius = 2 + level * 8;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={radius}
              fill="url(#audioGradient)"
              className={cn(
                "transition-all duration-100",
                isActive && "animate-pulse"
              )}
              style={{
                animationDelay: `${i * 50}ms`,
                opacity: isActive ? 0.6 + level * 0.4 : 0.2
              }}
            />
          );
        })}
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <div className={cn(
            "w-8 h-8 rounded-full bg-primary transition-all duration-300",
            isActive && "animate-pulse scale-110"
          )} />
        </div>
      </div>
    </div>
  );
};

interface WaveformVisualizerProps {
  isActive: boolean;
  audioLevel: number;
  className?: string;
  waveCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive,
  audioLevel,
  className,
  waveCount = 3
}) => {
  const [waves, setWaves] = useState<number[][]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isActive) {
      const updateWaves = () => {
        setWaves(prev => {
          const newWaves = [...prev];
          
          for (let wave = 0; wave < waveCount; wave++) {
            if (!newWaves[wave]) newWaves[wave] = [];
            
            for (let i = 0; i < 50; i++) {
              const time = Date.now() * 0.001;
              const frequency = 0.5 + wave * 0.3;
              const amplitude = audioLevel * (0.5 + Math.random() * 0.5);
              
              newWaves[wave][i] = Math.sin(time * frequency + i * 0.2) * amplitude;
            }
          }
          
          return newWaves;
        });
        
        animationRef.current = requestAnimationFrame(updateWaves);
      };
      
      updateWaves();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setWaves([]);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioLevel, waveCount]);

  return (
    <div className={cn("relative h-20 overflow-hidden", className)}>
      {waves.map((wave, waveIndex) => (
        <svg
          key={waveIndex}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
        >
          <path
            d={`M 0,50 ${wave.map((value, i) => 
              `L ${(i / (wave.length - 1)) * 200},${50 + value * 30}`
            ).join(' ')} L 200,50`}
            fill="none"
            stroke={`hsl(var(--primary))`}
            strokeWidth="2"
            opacity={0.3 + waveIndex * 0.2}
            className={cn(
              "transition-all duration-100",
              isActive && "animate-pulse"
            )}
            style={{
              animationDelay: `${waveIndex * 200}ms`
            }}
          />
        </svg>
      ))}
    </div>
  );
};
