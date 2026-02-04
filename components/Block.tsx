import React from 'react';

interface BlockProps {
  color: string | null;
  size?: string; // Tailwind class, e.g. "w-full h-full"
}

export const Block: React.FC<BlockProps> = ({ color, size = "w-full h-full" }) => {
  if (!color) {
    return (
      <div 
        className={`${size} bg-emptyCell rounded-[4px]`}
        style={{ transition: 'background-color 0.2s' }}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-[4px] shadow-plastic`}
      style={{ 
        backgroundColor: color,
        border: '1px solid rgba(255,255,255,0.2)' 
      }}
    />
  );
};