import React from 'react';
import { Difficulty } from '../types';
import { playButtonSound } from '../utils/sound';

interface MenuProps {
  onStart: (diff: Difficulty) => void;
  isVisible: boolean;
}

export const Menu: React.FC<MenuProps> = ({ onStart, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gameBg flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-6xl font-black text-black mb-12 text-center leading-tight drop-shadow-md">
        SUPER<br/>PUZZLE<br/>BLOCK 😎
      </h1>
      
      <div className="flex flex-col gap-6 w-full max-w-xs">
        {Object.values(Difficulty).map((diff) => (
          <button
            key={diff}
            onClick={() => {
              playButtonSound();
              onStart(diff);
            }}
            className="w-full py-4 bg-black rounded-lg shadow-lg active:scale-95 transition-transform border-2 border-white/10"
          >
            <span className="text-2xl font-bold text-[#FF0000] tracking-widest">
              {diff === 'EASY' ? 'FÁCIL' : diff === 'MEDIUM' ? 'MEDIO' : 'DIFÍCIL'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};