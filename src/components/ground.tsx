export const Ground: React.FC = () => (
    <div
      className="absolute bottom-0 w-full h-[112px]"
      style={{
        backgroundImage: 'url("/ground.png")',
        backgroundRepeat: 'repeat-x',
        zIndex: 2,
      }}
    />
);