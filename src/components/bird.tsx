interface BirdProps {
    position: number;
    velocity: number;
}
  
export const Bird: React.FC<BirdProps> = ({ position, velocity }) => (
    <div
      className="absolute w-[68px] h-[48px] transition-transform"
      style={{
        left: '100px',
        top: `${position}px`,
        transform: `rotate(${velocity * 3}deg)`,
        backgroundImage: 'url("/audrey.png")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      }}
    />
);