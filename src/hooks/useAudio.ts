import { useEffect, useRef } from "react";

export const useAudio = () => {
    const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
    const deathSoundRef = useRef<HTMLAudioElement | null>(null);
  
    useEffect(() => {
      jumpSoundRef.current = new Audio('/bruh.mp3');
      deathSoundRef.current = new Audio('/aintnoway.mp3');
    }, []);
  
    const playJumpSound = () => {
      if (jumpSoundRef.current) {
        jumpSoundRef.current.currentTime = 0;
        jumpSoundRef.current.play().catch(error => console.log('Jump sound playback failed:', error));
      }
    };
  
    const playDeathSound = () => {
      if (deathSoundRef.current) {
        deathSoundRef.current.currentTime = 0;
        deathSoundRef.current.play().catch(error => console.log('Death sound playback failed:', error));
      }
    };
  
    return { playJumpSound, playDeathSound };
};