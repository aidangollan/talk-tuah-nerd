interface ScoreProps {
    score: number;
}
  
export const Score: React.FC<ScoreProps> = ({ score }) => (
    <div className="absolute top-4 left-0 w-full text-center text-white text-4xl font-bold">
      {score}
    </div>
);