import React from 'react';

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  prefixAddon?: React.ReactNode;
  suffixAddon?: React.ReactNode;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  prefixAddon,
  suffixAddon,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-stretch border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] bg-[var(--nb-surface)] ${className}`} {...props}>
      {prefixAddon && (
        <div className="px-3 py-2 bg-[var(--nb-yellow)] border-r-[3px] border-[var(--nb-border)] font-black text-xs uppercase flex items-center justify-center select-none shrink-0">
          {prefixAddon}
        </div>
      )}
      <div className="flex-1 [&_input]:border-0 [&_input]:shadow-none [&_input]:bg-transparent">
        {children}
      </div>
      {suffixAddon && (
        <div className="px-3 py-2 bg-[var(--nb-mint)] border-l-[3px] border-[var(--nb-border)] font-black text-xs uppercase flex items-center justify-center select-none shrink-0">
          {suffixAddon}
        </div>
      )}
    </div>
  );
};
