"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRAVITY = 0.6;
const JUMP_FORCE = -9;
const PIPE_SPEED = 3.5;
const PIPE_SPAWN_RATE = 1500;
const PIPE_GAP = 170;

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

interface BirdRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function isKeyboardEvent(event: KeyboardEvent | MouseEvent): event is KeyboardEvent {
  return 'code' in event;
}

const FlappyBird: React.FC = () => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [birdPos, setBirdPos] = useState<number>(250);
  const [birdVelocity, setBirdVelocity] = useState<number>(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  
  const gameRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPipeRef = useRef<number>(Date.now());
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements
    jumpSoundRef.current = new Audio('/bruh.mp3');
    deathSoundRef.current = new Audio('/aintnoway.mp3');
  }, []);

  const generatePipe = useCallback((): Pipe => {
    const minHeight = 50;
    const maxHeight = 300;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    return {
      x: 800,
      topHeight: height,
      bottomHeight: 400 - height - PIPE_GAP,
      passed: false,
    };
  }, []);

  const handleJump = useCallback((e: KeyboardEvent | MouseEvent) => {
    if ((isKeyboardEvent(e) && e.code === 'Space') || (!isKeyboardEvent(e) && e.type === 'click')) {
      if (!gameStarted) {
        setGameStarted(true);
      }
      setBirdVelocity(JUMP_FORCE);
      
      // Play jump sound
      if (jumpSoundRef.current) {
        jumpSoundRef.current.currentTime = 0;
        jumpSoundRef.current.play().catch(error => console.log('Jump sound playback failed:', error));
      }
    }
  }, [gameStarted]);

  const resetGame = useCallback((): void => {
    setBirdPos(250);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    lastPipeRef.current = Date.now();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameOver) {
        resetGame();
      } else {
        handleJump(e);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    if (gameRef.current) {
      gameRef.current.addEventListener('click', handleJump as EventListener);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (gameRef.current) {
        gameRef.current.removeEventListener('click', handleJump as EventListener);
      }
    };
  }, [handleJump, gameOver, resetGame]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const updateGame = (): void => {
      setBirdVelocity(v => v + GRAVITY);
      setBirdPos(pos => pos + birdVelocity);

      if (Date.now() - lastPipeRef.current >= PIPE_SPAWN_RATE) {
        setPipes(pipes => [...pipes, generatePipe()]);
        lastPipeRef.current = Date.now();
      }

      setPipes(currentPipes => {
        const newPipes = currentPipes
          .map(pipe => ({
            ...pipe,
            x: pipe.x - PIPE_SPEED,
          }))
          .filter(pipe => pipe.x > -60);

        const birdRect: BirdRect = {
          x: 100,
          y: birdPos,
          width: 68,
          height: 38,
        };

        for (const pipe of newPipes) {
          if (
            birdRect.x + birdRect.width > pipe.x &&
            birdRect.x < pipe.x + 52 &&
            (birdRect.y < pipe.topHeight || birdRect.y + birdRect.height > pipe.topHeight + PIPE_GAP)
          ) {
            setGameOver(true);
            if (deathSoundRef.current) {
              deathSoundRef.current.currentTime = 0;
              deathSoundRef.current.play().catch(error => console.log('Death sound playback failed:', error));
            }
          }

          if (!pipe.passed && pipe.x + 52 < birdRect.x) {
            pipe.passed = true;
            setScore(s => s + 1);
          }
        }

        return newPipes;
      });

      if (birdPos < 0 || birdPos > 576) {
        setGameOver(true);
      }

      frameRef.current = requestAnimationFrame(updateGame);
    };

    frameRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameStarted, gameOver, birdVelocity, birdPos, generatePipe]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-[length:200%_200%]">
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s linear infinite;
        }
      `}</style>
      <div 
        ref={gameRef}
        className="relative w-[800px] h-[600px] overflow-hidden cursor-pointer"
        style={{
          backgroundImage: 'url("/background.png")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        {/* Bird */}
        <div
          className="absolute w-[68px] h-[48px] transition-transform"
          style={{
            left: '100px',
            top: `${birdPos}px`,
            transform: `rotate(${birdVelocity * 3}deg)`,
            backgroundImage: 'url("/audrey.png")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Top pipe */}
            <div
              className="absolute w-[52px]"
              style={{
                left: `${pipe.x}px`,
                top: 0,
                height: `${pipe.topHeight}px`,
                backgroundImage: 'url("/nosu.png")',
                backgroundSize: '52px 100%',
                backgroundRepeat: 'no-repeat',
                transform: 'rotate(180deg)',
              }}
            />
            {/* Bottom pipe */}
            <div
              className="absolute w-[52px]"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.topHeight + PIPE_GAP}px`,
                height: '800px',
                backgroundImage: 'url("/nosu.png")',
                backgroundSize: '52px 100%',
                backgroundRepeat: 'no-repeat',
                zIndex: 1,
              }}
            />
          </React.Fragment>
        ))}

        {/* Ground */}
        <div
          className="absolute bottom-0 w-full h-[112px]"
          style={{
            backgroundImage: 'url("/ground.png")',
            backgroundRepeat: 'repeat-x',
            zIndex: 2,
          }}
        />

        {/* Score */}
        <div className="absolute top-4 left-0 w-full text-center text-white text-4xl font-bold">
          {score}
        </div>

        {!gameStarted && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl text-center">
            Click or Press Space to Start
          </div>
        )}

        {gameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl text-center">
            You died LOL<br />
            Score: {score}<br />
            Press Space to Restart
          </div>
        )}
      </div>
    </div>
  );
};

export default FlappyBird;