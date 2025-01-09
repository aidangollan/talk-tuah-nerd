import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "./useAudio";
import { GRAVITY, JUMP_FORCE, PIPE_GAP, PIPE_SPAWN_RATE, PIPE_SPEED } from "~/constants";
import { BirdRect, Pipe } from "~/types";

function isKeyboardEvent(event: KeyboardEvent | MouseEvent): event is KeyboardEvent {
    return 'code' in event;
}

export const useGameLogic = () => {
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [birdPos, setBirdPos] = useState<number>(250);
    const [birdVelocity, setBirdVelocity] = useState<number>(0);
    const [pipes, setPipes] = useState<Pipe[]>([]);
    
    const frameRef = useRef<number | null>(null);
    const lastPipeRef = useRef<number>(Date.now());
    const { playJumpSound, playDeathSound } = useAudio();
  
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
        playJumpSound();
      }
    }, [gameStarted, playJumpSound]);
  
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
              playDeathSound();
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
    }, [gameStarted, gameOver, birdVelocity, birdPos, generatePipe, playDeathSound]);
  
    return {
      gameStarted,
      gameOver,
      score,
      birdPos,
      birdVelocity,
      pipes,
      handleJump,
      resetGame
    };
};