import React, { useState } from 'react';

export interface TooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
}) => {
  const [visible, setVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-3 py-1.5 bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)] font-black text-xs uppercase tracking-wider border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] whitespace-nowrap pointer-events-none ${positionStyles[position]}`}
          style={{
            boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
