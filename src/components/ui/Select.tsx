import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const [isFocused, setIsFocused] = useState(false);

  // Stable random neon color assigned on mount
  const randomTone = useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'];
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  const focusBgColor = `var(--nb-${randomTone})`;
  const focusTextColor = randomTone === 'pink' ? 'white' : 'var(--nb-text-on-accent)';
  const shadowColor = `var(--nb-shadow-${randomTone})`;

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-4 py-2.5 font-extrabold uppercase border-[3px] border-[var(--nb-border)] outline-none appearance-none cursor-pointer rounded-none disabled:opacity-50 ${
            error ? 'border-red-600 bg-red-50 text-red-900' : 'bg-[var(--nb-input-bg)]'
          } ${className}`}
          style={{
            boxShadow: isFocused ? `4px 4px 0px 0px ${shadowColor}` : `2px 2px 0px 0px ${shadowColor}`,
            transform: isFocused ? 'translate(-1px, -1px)' : 'none',
            backgroundColor: isFocused && !error ? focusBgColor : undefined,
            color: isFocused && !error ? focusTextColor : 'var(--nb-text)',
          }}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="font-bold py-1">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nb-text)] stroke-[3] pointer-events-none" />
      </div>
      {error && <span className="text-xs font-bold text-red-600 uppercase">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
