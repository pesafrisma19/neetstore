import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  tone?: 'yellow' | 'pink' | 'mint' | 'purple';
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  tone = 'yellow',
  disabled = false,
  className = '',
}) => {
  const toneBg = {
    yellow: 'bg-[var(--nb-yellow)]',
    pink: 'bg-[var(--nb-pink)]',
    mint: 'bg-[var(--nb-mint)]',
    purple: 'bg-[var(--nb-purple)]',
  };

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-14 h-8 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] p-0.5 transition-colors cursor-pointer relative ${
          checked ? toneBg[tone] : 'bg-[var(--nb-surface-alt)]'
        }`}
        style={{
          boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
        }}
      >
        <div
          className={`w-6 h-6 border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] bg-[var(--nb-surface)] rounded-[var(--nb-radius-badge)] transform transition-transform duration-150 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
          style={{
            boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
          }}
        />
      </button>
      {label && <span className="text-xs font-black uppercase text-[var(--nb-text)]">{label}</span>}
    </label>
  );
};
