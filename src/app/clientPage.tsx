"use client"

import React, { useEffect, useRef } from 'react';
import { Bird } from '~/components/bird';
import { GameMessages } from '~/components/game-messages';
import { Ground } from '~/components/ground';
import { PipePair } from '~/components/pipe';
import { Score } from '~/components/score';
import { useGameLogic } from '~/hooks/useGame';

const FlappyBird: React.FC = () => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const {
    gameStarted,
    gameOver,
    score,
    birdPos,
    birdVelocity,
    pipes,
    handleJump,
    resetGame
  } = useGameLogic();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameOver) {
        resetGame();
      } else {
        handleJump(e);
      }
    };

    const currentGameRef = gameRef.current;

    window.addEventListener('keydown', handleKeyPress);
    if (currentGameRef) {
      currentGameRef.addEventListener('click', handleJump as EventListener);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (currentGameRef) {
        currentGameRef.removeEventListener('click', handleJump as EventListener);
      }
    };
  }, [handleJump, gameOver, resetGame]);

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
        <Bird position={birdPos} velocity={birdVelocity} />
        {pipes.map((pipe, index) => (
          <PipePair key={index} pipe={pipe} />
        ))}
        <Ground />
        <Score score={score} />
        <GameMessages 
          gameStarted={gameStarted}
          gameOver={gameOver}
          score={score}
        />
      </div>
    </div>
  );
};

export default FlappyBird;