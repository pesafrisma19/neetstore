import React, { useMemo, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
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
        <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)] flex items-center gap-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        {...props}
        value={props.value ?? ''}
        className={`w-full px-4 py-2.5 font-semibold border-[3px] border-[var(--nb-border)] outline-none transition-all duration-150 rounded-none disabled:opacity-50 disabled:bg-[var(--nb-surface-alt)] ${
          error ? 'border-red-600 bg-red-50 text-red-900 placeholder:text-red-400' : 'bg-[var(--nb-input-bg)] placeholder:text-[var(--nb-text-muted)]'
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
      />
      {error && <span className="text-xs font-bold text-red-600 uppercase">{error}</span>}
      {helperText && !error && <span className="text-xs font-medium text-[var(--nb-text-muted)]">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';
