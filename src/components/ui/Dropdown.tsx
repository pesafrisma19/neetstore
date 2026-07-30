import React, { useState } from 'react';

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  tone?: 'default' | 'danger';
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-40 w-48 bg-[var(--nb-surface)] border-[3px] border-[var(--nb-border)] shadow-[4px_4px_0px_0px_var(--nb-shadow)] py-1 flex flex-col">
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={`w-full px-4 py-2.5 text-left text-xs font-black uppercase flex items-center gap-2 border-b-[1.5px] border-[var(--nb-border)] last:border-b-0 hover:bg-[var(--nb-yellow)] transition-colors ${
                  item.tone === 'danger' ? 'text-red-600 hover:bg-red-500 hover:text-white' : 'text-[var(--nb-text)]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
