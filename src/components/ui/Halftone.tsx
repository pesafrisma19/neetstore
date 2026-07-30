import React from 'react';

export interface HalftoneProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'black' | 'yellow' | 'pink' | 'mint' | 'purple';
}

export const Halftone: React.FC<HalftoneProps> = ({
  tone = 'black',
  className = '',
  ...props
}) => {
  const dotColors = {
    black: 'radial-gradient(#000000 1.5px, transparent 1.5px)',
    yellow: 'radial-gradient(#FFDC00 2px, transparent 2px)',
    pink: 'radial-gradient(#FF4D79 2px, transparent 2px)',
    mint: 'radial-gradient(#6EE7B7 2px, transparent 2px)',
    purple: 'radial-gradient(#C4B5FD 2px, transparent 2px)',
  };

  return (
    <div
      className={`w-full h-full min-h-[40px] border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface)] ${className}`}
      style={{
        backgroundImage: dotColors[tone],
        backgroundSize: '12px 12px',
      }}
      {...props}
    />
  );
};
