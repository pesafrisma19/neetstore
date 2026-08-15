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
          <div
            className="absolute right-0 mt-2 z-40 w-48 bg-[var(--nb-surface)] border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-element)] overflow-hidden py-1 flex flex-col"
            style={{
              boxShadow: `var(--nb-shadow-x) var(--nb-shadow-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
            }}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={`w-full px-4 py-2.5 text-left text-xs font-black uppercase flex items-center gap-2 border-b-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] last:border-b-0 transition-colors cursor-pointer ${
                  item.tone === 'danger'
                    ? 'text-[var(--nb-danger)] hover:bg-[var(--nb-danger)] hover:text-[var(--nb-text-on-accent)]'
                    : 'text-[var(--nb-text)] hover:bg-[var(--nb-yellow)] hover:text-[var(--nb-text-on-accent)]'
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
