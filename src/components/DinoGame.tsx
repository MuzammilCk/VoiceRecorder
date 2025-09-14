import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './DinoGame.css';

// Extend the global Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
}

interface DinoState {
  y: number;
  velocityY: number;
  isJumping: boolean;
  isDucking: boolean;
}

const DinoGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Game constants
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 400;
  const GROUND_Y = 320;
  const DINO_X = 80;
  const DINO_WIDTH = 40;
  const DINO_HEIGHT = 60;
  const DINO_DUCK_HEIGHT = 30;
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GAME_SPEED = 5;
  const OBSTACLE_SPAWN_RATE = 0.02;

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('dinoHighScore') || '0'),
  });

  const [dinoState, setDinoState] = useState<DinoState>({
    y: GROUND_Y - DINO_HEIGHT,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
  });

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const obstacleIdRef = useRef(0);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          setLastCommand(command);
          handleVoiceCommand(command);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          if (isListening && gameState.isPlaying && !gameState.isPaused) {
            // Restart recognition if game is still playing
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch (error) {
                console.error('Error restarting speech recognition:', error);
              }
            }, 100);
          } else {
            setIsListening(false);
          }
        };
      }
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. You can still play with keyboard controls.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    console.log('Voice command received:', command);
    
    if (command.includes('jump')) {
      jump();
      toast({
        title: "Voice Command",
        description: "Jump command recognized!",
        duration: 1000,
      });
    } else if (command.includes('duck') || command.includes('down')) {
      duck();
      toast({
        title: "Voice Command",
        description: "Duck command recognized!",
        duration: 1000,
      });
    } else if (command.includes('start game') || command.includes('start')) {
      if (!gameState.isPlaying) {
        startGame();
        toast({
          title: "Voice Command",
          description: "Start game command recognized!",
          duration: 1000,
        });
      }
    } else if (command.includes('pause game') || command.includes('pause')) {
      if (gameState.isPlaying && !gameState.isPaused) {
        pauseGame();
        toast({
          title: "Voice Command",
          description: "Pause game command recognized!",
          duration: 1000,
        });
      }
    }
  }, [gameState.isPlaying, gameState.isPaused]);

  // Game actions
  const jump = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;
    
    setDinoState(prev => {
      if (!prev.isJumping) {
        return {
          ...prev,
          velocityY: JUMP_FORCE,
          isJumping: true,
          isDucking: false,
        };
      }
      return prev;
    });
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  const duck = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;
    
    setDinoState(prev => ({
      ...prev,
      isDucking: true,
    }));

    // Stop ducking after a short duration
    setTimeout(() => {
      setDinoState(prev => ({
        ...prev,
        isDucking: false,
      }));
    }, 500);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      score: 0,
    }));
    
    setDinoState({
      y: GROUND_Y - DINO_HEIGHT,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
    });
    
    setObstacles([]);
    obstacleIdRef.current = 0;
    
    // Start voice recognition
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const pauseGame = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));

    if (recognitionRef.current) {
      if (gameState.isPaused) {
        // Resume recognition
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error resuming speech recognition:', error);
        }
      } else {
        // Pause recognition
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      score: 0,
    }));
    
    setDinoState({
      y: GROUND_Y - DINO_HEIGHT,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
    });
    
    setObstacles([]);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Game over
  const gameOver = () => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      localStorage.setItem('dinoHighScore', newHighScore.toString());
      
      return {
        ...prev,
        isGameOver: true,
        isPlaying: false,
        highScore: newHighScore,
      };
    });

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Collision detection
  const checkCollision = useCallback((dino: DinoState, obstacle: Obstacle): boolean => {
    const dinoHeight = dino.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const dinoY = dino.isDucking ? GROUND_Y - DINO_DUCK_HEIGHT : dino.y;
    
    return (
      DINO_X < obstacle.x + obstacle.width &&
      DINO_X + DINO_WIDTH > obstacle.x &&
      dinoY < obstacle.y + obstacle.height &&
      dinoY + dinoHeight > obstacle.y
    );
  }, []);

  // Generate obstacles
  const generateObstacle = useCallback((): Obstacle => {
    const types: ('cactus' | 'bird')[] = ['cactus', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: obstacleIdRef.current++,
      x: GAME_WIDTH,
      y: type === 'cactus' ? GROUND_Y - 40 : GROUND_Y - 80,
      width: type === 'cactus' ? 20 : 30,
      height: type === 'cactus' ? 40 : 20,
      type,
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const gameLoop = () => {
      // Update dino physics
      setDinoState(prev => {
        let newY = prev.y + prev.velocityY;
        let newVelocityY = prev.velocityY + GRAVITY;
        let newIsJumping = prev.isJumping;

        // Ground collision
        if (newY >= GROUND_Y - (prev.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT)) {
          newY = GROUND_Y - (prev.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT);
          newVelocityY = 0;
          newIsJumping = false;
        }

        return {
          ...prev,
          y: newY,
          velocityY: newVelocityY,
          isJumping: newIsJumping,
        };
      });

      // Update obstacles
      setObstacles(prev => {
        let newObstacles = prev.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - GAME_SPEED,
        })).filter(obstacle => obstacle.x > -obstacle.width);

        // Generate new obstacles
        if (Math.random() < OBSTACLE_SPAWN_RATE) {
          newObstacles.push(generateObstacle());
        }

        return newObstacles;
      });

      // Update score
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
      }));

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, generateObstacle]);

  // Check collisions
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

    for (const obstacle of obstacles) {
      if (checkCollision(dinoState, obstacle)) {
        gameOver();
        break;
      }
    }
  }, [dinoState, obstacles, gameState.isPlaying, gameState.isPaused, gameState.isGameOver, checkCollision]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        jump();
      } else if (event.code === 'ArrowDown') {
        event.preventDefault();
        duck();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, duck]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#83786f';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // Draw ground line
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(GAME_WIDTH, GROUND_Y);
    ctx.stroke();

    // Draw dino
    ctx.fillStyle = '#535353';
    const dinoHeight = dinoState.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const dinoY = dinoState.isDucking ? GROUND_Y - DINO_DUCK_HEIGHT : dinoState.y;
    ctx.fillRect(DINO_X, dinoY, DINO_WIDTH, dinoHeight);

    // Draw dino eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(DINO_X + 25, dinoY + 10, 8, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(DINO_X + 27, dinoY + 12, 4, 4);

    // Draw obstacles
    obstacles.forEach(obstacle => {
      if (obstacle.type === 'cactus') {
        ctx.fillStyle = '#3d5a27';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    });

    // Draw clouds
    ctx.fillStyle = '#c0c0c0';
    for (let i = 0; i < 3; i++) {
      const x = (gameState.score + i * 200) % (GAME_WIDTH + 100) - 50;
      ctx.beginPath();
      ctx.arc(x, 80 + i * 30, 15, 0, Math.PI * 2);
      ctx.arc(x + 20, 80 + i * 30, 20, 0, Math.PI * 2);
      ctx.arc(x + 40, 80 + i * 30, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [dinoState, obstacles, gameState.score]);

  return (
    <div className="dino-game-container">
      <Card className="dino-game-card">
        <div className="dino-game-header">
          <h1 className="dino-game-title">🦕 Voice-Controlled Dino Game</h1>
          <div className="dino-game-stats">
            <Badge variant="secondary" className="score-badge">
              Score: {gameState.score}
            </Badge>
            <Badge variant="outline" className="high-score-badge">
              High Score: {gameState.highScore}
            </Badge>
            {isListening && (
              <Badge variant="default" className="listening-badge">
                <Mic className="w-3 h-3 mr-1" />
                Listening
              </Badge>
            )}
          </div>
        </div>

        <div className="dino-game-canvas-container">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="dino-game-canvas"
          />
          
          {gameState.isGameOver && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>Game Over!</h2>
                <p>Final Score: {gameState.score}</p>
                {gameState.score === gameState.highScore && gameState.score > 0 && (
                  <p className="new-high-score">🎉 New High Score!</p>
                )}
                <Button onClick={resetGame} className="restart-button">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="dino-game-controls">
          <div className="control-buttons">
            {!gameState.isPlaying ? (
              <Button onClick={startGame} className="start-button">
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            ) : (
              <Button onClick={pauseGame} variant="outline">
                {gameState.isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            )}
            
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="voice-status">
            {isListening ? (
              <div className="listening-indicator">
                <Mic className="w-5 h-5 text-green-500" />
                <span>Voice control active</span>
              </div>
            ) : (
              <div className="not-listening-indicator">
                <MicOff className="w-5 h-5 text-gray-400" />
                <span>Voice control inactive</span>
              </div>
            )}
            {lastCommand && (
              <div className="last-command">
                Last command: "{lastCommand}"
              </div>
            )}
          </div>
        </div>

        <div className="dino-game-instructions">
          <h3>How to Play:</h3>
          <div className="instructions-grid">
            <div className="voice-commands">
              <h4>🎤 Voice Commands:</h4>
              <ul>
                <li><strong>"Jump"</strong> - Make the dino jump</li>
                <li><strong>"Duck"</strong> - Make the dino duck</li>
                <li><strong>"Start game"</strong> - Start a new game</li>
                <li><strong>"Pause game"</strong> - Pause/resume the game</li>
              </ul>
            </div>
            <div className="keyboard-controls">
              <h4>⌨️ Keyboard Controls:</h4>
              <ul>
                <li><strong>Space/↑</strong> - Jump</li>
                <li><strong>↓</strong> - Duck</li>
              </ul>
            </div>
          </div>
          <p className="game-objective">
            Avoid obstacles by jumping over cacti and ducking under birds. Your score increases as you survive longer!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DinoGame;
