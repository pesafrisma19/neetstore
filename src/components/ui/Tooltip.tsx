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
          className={`absolute z-50 px-3 py-1.5 bg-[var(--nb-yellow)] text-[var(--nb-text)] font-black text-xs uppercase tracking-wider border-[2.5px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] whitespace-nowrap pointer-events-none ${positionStyles[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
