import { PIPE_GAP } from "~/constants";
import { type Pipe } from "~/types";

interface PipeProps {
    pipe: Pipe;
}
  
export const PipePair: React.FC<PipeProps> = ({ pipe }) => (
    <>
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
    </>
);