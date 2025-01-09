"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { processAudio } from '~/server/actions/voice';

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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  
  const gameRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPipeRef = useRef<number>(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
    }
  }, [gameStarted]);

  const resetGame = useCallback((): void => {
    setBirdPos(250);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setIsRecording(false);
    lastPipeRef.current = Date.now();
    
    // Stop current recording if it exists
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Audio setup effect
  useEffect(() => {
    let chunks: Blob[] = [];
    
    async function setupAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        setAudioPermission(true);

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
            // Process the audio chunk immediately
            const audioBlob = new Blob([event.data], { type: 'audio/webm' });
            if (!gameOver) {
              const isValidFlap = await processAudio(audioBlob);
              if (isValidFlap) {
                setBirdVelocity(JUMP_FORCE);
              }
            }
          }
        };

        // Stop any existing recording
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }

        chunks = []; // Reset chunks
        mediaRecorder.start(500); // Record in 500ms chunks
        
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setAudioPermission(false);
      }
    }

    if (gameStarted && !isRecording) {
      setIsRecording(true);
      setupAudio();
    }

    return () => {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }
    };
  }, [gameStarted, isRecording, gameOver]);

  // Game controls effect
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

  // Game loop effect
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
          width: 34,
          height: 24,
        };

        for (const pipe of newPipes) {
          if (
            birdRect.x + birdRect.width > pipe.x &&
            birdRect.x < pipe.x + 52 &&
            (birdRect.y < pipe.topHeight || birdRect.y + birdRect.height > pipe.topHeight + PIPE_GAP)
          ) {
            setGameOver(true);
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
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
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
          className="absolute w-[34px] h-[24px] transition-transform"
          style={{
            left: '100px',
            top: `${birdPos}px`,
            transform: `rotate(${birdVelocity * 3}deg)`,
            backgroundImage: 'url("/bird.png")',
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
                backgroundImage: 'url("/pipe.png")',
                backgroundSize: '100% 100%',
                transform: 'rotate(180deg)',
                zIndex: 1,
              }}
            />
            {/* Bottom pipe */}
            <div
              className="absolute w-[52px]"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.topHeight + PIPE_GAP}px`,
                height: '800px',
                backgroundImage: 'url("/pipe.png")',
                backgroundSize: '52px auto',
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
        <div className="absolute top-4 left-0 w-full text-center text-white text-4xl font-bold z-10">
          {score}
        </div>

        {!gameStarted && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl text-center z-10">
            Click or Press Space to Start<br />
            Say "Hey!" to Flap!
          </div>
        )}

        {!audioPermission && gameStarted && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-red-500 text-xl z-10">
            Please enable microphone access!
          </div>
        )}

        {gameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl text-center z-10">
            Game Over!<br />
            Score: {score}<br />
            Press Space to Restart
          </div>
        )}
      </div>
    </div>
  );
};

export default FlappyBird;