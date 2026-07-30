import React from 'react';

export interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  tone?: 'dark' | 'yellow' | 'pink' | 'white';
}

export const Code: React.FC<CodeProps> = ({
  children,
  tone = 'dark',
  className = '',
  ...props
}) => {
  const toneStyles = {
    dark: 'bg-black text-[#6EE7B7]',
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text)]',
    pink: 'bg-[var(--nb-pink)] text-white',
    white: 'bg-[var(--nb-surface)] text-[var(--nb-text)]',
  };

  return (
    <pre
      className={`p-4 border-[3px] border-[var(--nb-border)] shadow-[4px_4px_0px_0px_var(--nb-shadow)] font-mono text-xs overflow-x-auto text-left leading-relaxed ${toneStyles[tone]} ${className}`}
      {...props}
    >
      <code>{children}</code>
    </pre>
  );
};
