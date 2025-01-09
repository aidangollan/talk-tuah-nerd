interface GameMessagesProps {
    gameStarted: boolean;
    gameOver: boolean;
    score: number;
}
  
export const GameMessages: React.FC<GameMessagesProps> = ({ gameStarted, gameOver, score }) => (
    <>
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
    </>
);