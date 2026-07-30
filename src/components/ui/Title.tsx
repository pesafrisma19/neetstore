import React from 'react';

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  badge?: string;
  badgeTone?: 'yellow' | 'pink' | 'mint' | 'purple';
}

export const Title: React.FC<TitleProps> = ({
  children,
  level = 2,
  badge,
  badgeTone = 'yellow',
  className = '',
  ...props
}) => {
  const badgeColors = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text)]',
    pink: 'bg-[var(--nb-pink)] text-white',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text)]',
  };

  const levelStyles = {
    1: 'text-3xl md:text-4xl font-black',
    2: 'text-2xl md:text-3xl font-black',
    3: 'text-xl md:text-2xl font-black',
    4: 'text-lg font-black',
  };

  if (level === 1) {
    return (
      <div className="flex items-center gap-2 text-left">
        {badge && <span className={`text-xs font-black uppercase px-2 py-0.5 border-[2px] border-[var(--nb-border)] shadow-[1.5px_1.5px_0px_0px_#000] ${badgeColors[badgeTone]}`}>{badge}</span>}
        <h1 className={`uppercase tracking-tight text-[var(--nb-text)] m-0 ${levelStyles[1]} ${className}`} {...props}>{children}</h1>
      </div>
    );
  }

  if (level === 3) {
    return (
      <div className="flex items-center gap-2 text-left">
        {badge && <span className={`text-xs font-black uppercase px-2 py-0.5 border-[2px] border-[var(--nb-border)] shadow-[1.5px_1.5px_0px_0px_#000] ${badgeColors[badgeTone]}`}>{badge}</span>}
        <h3 className={`uppercase tracking-tight text-[var(--nb-text)] m-0 ${levelStyles[3]} ${className}`} {...props}>{children}</h3>
      </div>
    );
  }

  if (level === 4) {
    return (
      <div className="flex items-center gap-2 text-left">
        {badge && <span className={`text-xs font-black uppercase px-2 py-0.5 border-[2px] border-[var(--nb-border)] shadow-[1.5px_1.5px_0px_0px_#000] ${badgeColors[badgeTone]}`}>{badge}</span>}
        <h4 className={`uppercase tracking-tight text-[var(--nb-text)] m-0 ${levelStyles[4]} ${className}`} {...props}>{children}</h4>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-left">
      {badge && <span className={`text-xs font-black uppercase px-2 py-0.5 border-[2px] border-[var(--nb-border)] shadow-[1.5px_1.5px_0px_0px_#000] ${badgeColors[badgeTone]}`}>{badge}</span>}
      <h2 className={`uppercase tracking-tight text-[var(--nb-text)] m-0 ${levelStyles[2]} ${className}`} {...props}>{children}</h2>
    </div>
  );
};
