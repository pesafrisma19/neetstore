import React, { useMemo, useState } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
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
        <label htmlFor={textareaId} className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`w-full p-3 font-semibold border-[length:var(--nb-border-width)] outline-none transition-all duration-150 rounded-[var(--nb-radius-element)] disabled:opacity-50 min-h-[100px] ${
          error
            ? 'border-[var(--nb-danger-border)] bg-[var(--nb-danger-bg)] text-[var(--nb-danger-text)] placeholder:text-[var(--nb-danger-text)]/60'
            : 'border-[var(--nb-border)] bg-[var(--nb-surface)] placeholder:text-[var(--nb-text-muted)]'
        } ${className}`}
        style={{
          boxShadow: isFocused
            ? `var(--nb-shadow-x) var(--nb-shadow-y) var(--nb-shadow-blur) var(--nb-shadow-spread) ${shadowColor}`
            : `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) ${shadowColor}`,
          transform: isFocused ? 'translate(-1px, -1px)' : 'none',
          backgroundColor: isFocused && !error ? focusBgColor : undefined,
          color: isFocused && !error ? focusTextColor : error ? 'var(--nb-danger-text)' : 'var(--nb-text)',
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
      />
      {error && <span className="text-xs font-bold text-[var(--nb-danger-text)] uppercase">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
