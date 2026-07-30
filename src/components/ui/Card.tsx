import React, { useMemo } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'cream' | 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderWidth?: '3' | '4';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'white',
  shadow = 'lg',
  borderWidth = '3',
  className = '',
  style,
  ...props
}, ref) => {
  const isGeneric = variant === 'white' || variant === 'cream';

  const randomTone = useMemo(() => {
    if (!isGeneric) return null;
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'];
    return tones[Math.floor(Math.random() * tones.length)];
  }, []); // Only run once on mount

  const bgStyles = {
    white: 'bg-[var(--nb-card-white)]',
    cream: 'bg-[var(--nb-surface-alt)]',
    yellow: 'bg-[var(--nb-yellow)]',
    pink: 'bg-[var(--nb-pink)]',
    mint: 'bg-[var(--nb-mint)]',
    purple: 'bg-[var(--nb-purple)]',
    cyan: 'bg-[var(--nb-cyan)]',
  };

  // In dark mode, variant-colored cards get matching shadow via CSS vars
  // Generic cards (white/cream) get a random neon shadow
  const shadowColorMap: Record<string, string> = {
    white: randomTone ? `var(--nb-shadow-${randomTone})` : 'var(--nb-shadow)',
    cream: randomTone ? `var(--nb-shadow-${randomTone})` : 'var(--nb-shadow)',
    yellow: 'var(--nb-shadow-yellow)',
    pink: 'var(--nb-shadow-pink)',
    mint: 'var(--nb-shadow-mint)',
    purple: 'var(--nb-shadow-purple)',
    cyan: 'var(--nb-shadow-cyan)',
    dark: 'var(--nb-shadow)',
  };

  const shadowSizes: Record<string, string> = {
    none: '',
    sm: '2px 2px 0px 0px',
    md: '4px 4px 0px 0px',
    lg: '6px 6px 0px 0px',
    xl: '8px 8px 0px 0px',
  };

  const borderStyle = borderWidth === '4'
    ? 'border-[4px] border-[var(--nb-border)]'
    : 'border-[3px] border-[var(--nb-border)]';

  const shadowStyle = shadow !== 'none'
    ? { boxShadow: `${shadowSizes[shadow]} ${shadowColorMap[variant]}` }
    : {};

  return (
    <div
      ref={ref}
      className={`${bgStyles[variant]} ${borderStyle} overflow-hidden transition-colors duration-300 ${className}`}
      style={{ ...shadowStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement> & { headerBg?: string }> = ({
  children,
  headerBg,
  className = '',
  style,
  ...props
}) => {
  const randomTone = useMemo(() => {
    const tones = ['var(--nb-yellow)', 'var(--nb-pink)', 'var(--nb-mint)', 'var(--nb-purple)', 'var(--nb-cyan)'];
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  return (
    <div
      className={`p-4 border-b-[3px] border-[var(--nb-border)] font-black flex items-center justify-between text-[#000000] ${className}`}
      style={{ backgroundColor: randomTone, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight text-[#000000] m-0 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-4 md:p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-4 border-t-[3px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
