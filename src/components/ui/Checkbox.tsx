import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  tone?: 'yellow' | 'pink' | 'mint' | 'purple';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  tone = 'yellow',
  checked,
  className = '',
  id,
  onChange,
  ...props
}, ref) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const toneBg = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)]',
    pink: 'bg-[var(--nb-pink)] text-[var(--nb-text-on-accent)]',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text-on-accent)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text-on-accent)]',
  };

  return (
    <label htmlFor={checkboxId} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className={`w-6 h-6 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] transition-all flex items-center justify-center shrink-0 ${
            checked ? toneBg[tone] : 'bg-[var(--nb-surface)]'
          }`}
          style={{
            boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
          }}
        >
          <Check className={`w-4 h-4 stroke-[4] ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all`} />
        </div>
      </div>
      {label && <span className="text-xs font-black uppercase text-[var(--nb-text)] leading-snug">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
