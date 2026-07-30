import React from 'react';

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  tone?: 'yellow' | 'pink' | 'mint' | 'purple' | 'dark';
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  speed = 20,
  tone = 'yellow',
  className = '',
  ...props
}) => {
  const toneStyles = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text)]',
    pink: 'bg-[var(--nb-pink)] text-white',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text)]',
    dark: 'bg-black text-white',
  };

  return (
    <div
      className={`w-full overflow-hidden border-y-[3px] border-[var(--nb-border)] py-2 whitespace-nowrap select-none ${toneStyles[tone]} ${className}`}
      {...props}
    >
      <div
        className="inline-flex items-center gap-8 animate-marquee font-black uppercase text-xs tracking-widest"
        style={{ animationDuration: `${speed}s` }}
      >
        <span>{children}</span>
        <span>•</span>
        <span>{children}</span>
        <span>•</span>
        <span>{children}</span>
        <span>•</span>
        <span>{children}</span>
      </div>
    </div>
  );
};
