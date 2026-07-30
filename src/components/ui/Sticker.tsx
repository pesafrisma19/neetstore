import React from 'react';

export interface StickerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  angle?: string;
}

export const Sticker: React.FC<StickerProps> = ({
  children,
  variant = 'mint',
  size = 'md',
  angle = 'rotate-6',
  className = '',
  ...props
}) => {
  const fillColors: Record<string, string> = {
    mint: 'var(--nb-mint)',
    yellow: 'var(--nb-yellow)',
    pink: 'var(--nb-pink)',
    purple: 'var(--nb-purple)',
    cyan: 'var(--nb-cyan)',
    dark: 'var(--nb-dark-bg)',
  };

  const textColors: Record<string, string> = {
    mint: 'text-[var(--nb-text-on-accent)]',
    yellow: 'text-[var(--nb-text-on-accent)]',
    pink: 'text-white',
    purple: 'text-[var(--nb-text-on-accent)]',
    cyan: 'text-[var(--nb-text-on-accent)]',
    dark: 'text-[var(--nb-dark-text)]',
  };

  const dimensionStyles = {
    sm: 'w-14 h-14 text-[9px]',
    md: 'w-16 h-16 sm:w-20 sm:h-20 text-[10px] sm:text-xs',
    lg: 'w-24 h-24 text-xs sm:text-sm',
  };

  const fillColor = fillColors[variant] || fillColors.mint;
  const textColor = textColors[variant] || textColors.mint;

  // Shadow uses the variant's matching shadow color in dark mode
  const shadowColorMap: Record<string, string> = {
    mint: 'var(--nb-shadow-mint)',
    yellow: 'var(--nb-shadow-yellow)',
    pink: 'var(--nb-shadow-pink)',
    purple: 'var(--nb-shadow-purple)',
    cyan: 'var(--nb-shadow-cyan)',
    dark: 'var(--nb-shadow)',
  };
  const shadowColor = shadowColorMap[variant] || 'var(--nb-shadow)';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transform transition-transform hover:rotate-0 ${angle} ${dimensionStyles[size]} ${className}`}
      {...props}
    >
      {/* Hard Drop Shadow (offset starburst shape behind) */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none translate-x-[3px] translate-y-[3px]"
      >
        <polygon
          points="50,2 62,11 77,4 81,19 96,21 91,36 99,49 90,62 96,77 81,80 77,96 62,90 49,99 37,90 22,96 18,80 3,77 9,62 1,49 10,36 4,21 19,19 22,4 37,11"
          fill={shadowColor}
          stroke={shadowColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      {/* Main Foreground Starburst SVG */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
        <polygon
          points="50,2 62,11 77,4 81,19 96,21 91,36 99,49 90,62 96,77 81,80 77,96 62,90 49,99 37,90 22,96 18,80 3,77 9,62 1,49 10,36 4,21 19,19 22,4 37,11"
          fill={fillColor}
          stroke="var(--nb-border)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>

      {/* Content Text inside Spiky Badge */}
      <div
        className={`relative z-10 font-black uppercase text-center leading-tight tracking-tighter px-1 flex flex-col items-center justify-center ${textColor}`}
      >
        {children}
      </div>
    </div>
  );
};
