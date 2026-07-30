import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan' | 'white' | 'warning' | 'danger' | 'dark' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black uppercase tracking-wider border-[3px] border-[var(--nb-border)] transition-all duration-150 cursor-pointer select-none rounded-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const shadowColorMap: Record<string, string> = {
    yellow: 'var(--nb-shadow-yellow)',
    pink: 'var(--nb-shadow-pink)',
    mint: 'var(--nb-shadow-mint)',
    purple: 'var(--nb-shadow-purple)',
    cyan: 'var(--nb-shadow-cyan)',
    white: 'var(--nb-shadow)',
    warning: 'var(--nb-shadow-yellow)',
    danger: 'var(--nb-shadow-pink)',
    dark: 'var(--nb-shadow)',
    outline: 'var(--nb-shadow)',
    primary: 'var(--nb-shadow-yellow)',
  };

  const sizeMap = {
    sm: { px: 'px-3 py-1.5 text-xs gap-1.5', shadow: '2px', hoverShadow: '4px', move: '1px' },
    md: { px: 'px-5 py-2.5 text-sm gap-2', shadow: '4px', hoverShadow: '6px', move: '2px' },
    lg: { px: 'px-7 py-3.5 text-base gap-2.5', shadow: '5px', hoverShadow: '7px', move: '2px' },
  };

  const variantStyles: Record<string, string> = {
    yellow: `bg-[var(--nb-yellow)] text-[#000000] hover:bg-[var(--nb-yellow-hover)]`,
    pink: 'bg-[var(--nb-pink)] text-[#000000] hover:bg-[var(--nb-pink-hover)]',
    mint: `bg-[var(--nb-mint)] text-[#000000] hover:bg-[var(--nb-mint-hover)]`,
    purple: `bg-[var(--nb-purple)] text-[#000000] hover:bg-[var(--nb-purple-hover)]`,
    cyan: `bg-[var(--nb-cyan)] text-[#000000] hover:bg-[var(--nb-cyan-hover)]`,
    white: 'bg-[var(--nb-surface)] text-[var(--nb-text)] hover:opacity-90',
    warning: `bg-[var(--nb-orange)] text-[#000000] hover:bg-[var(--nb-orange-hover)]`,
    danger: `bg-[var(--nb-pink)] text-[#000000] hover:bg-[var(--nb-pink-hover)]`,
    dark: 'bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] hover:opacity-90',
    outline: 'bg-transparent text-[var(--nb-text)] hover:bg-[var(--nb-surface-alt)] border-[var(--nb-border)]',
    primary: `bg-[var(--nb-yellow)] text-[#000000] hover:bg-[var(--nb-yellow-hover)]`,
  };

  const s = sizeMap[size];
  const sc = shadowColorMap[variant as keyof typeof shadowColorMap] || 'var(--nb-shadow)';

  const widthClass = fullWidth ? 'w-full' : '';

  const dynamicStyle: React.CSSProperties = {
    boxShadow: `${s.shadow} ${s.shadow} 0px 0px ${sc}`,
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.transform = `translate(-${s.move}, -${s.move})`;
      e.currentTarget.style.boxShadow = `${s.hoverShadow} ${s.hoverShadow} 0px 0px ${sc}`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = `${s.shadow} ${s.shadow} 0px 0px ${sc}`;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.transform = `translate(${s.move}, ${s.move})`;
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.transform = `translate(-${s.move}, -${s.move})`;
      e.currentTarget.style.boxShadow = `${s.hoverShadow} ${s.hoverShadow} 0px 0px ${sc}`;
    }
  };

  return (
    <button
      className={`${baseStyles} ${s.px} ${variantStyles[variant as keyof typeof variantStyles]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      style={dynamicStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
