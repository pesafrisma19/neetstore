import React from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  const randomTone = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
      style={{ backgroundColor: 'var(--nb-overlay)' }}
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-lg bg-[var(--nb-surface)] border-[4px] border-[var(--nb-border)] rounded-[var(--nb-radius-card)] overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 ${className}`}
        style={{
          boxShadow: `var(--nb-shadow-xl-x) var(--nb-shadow-xl-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow-${randomTone})`,
        }}
      >
        {/* Fixed Header */}
        <div
          className="flex items-center justify-between p-4 border-b-[length:var(--nb-border-width)] border-[var(--nb-border)] shrink-0"
          style={{ backgroundColor: `var(--nb-${randomTone})` }}
        >
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[var(--nb-text-on-accent)] m-0">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] bg-[var(--nb-surface)] text-[var(--nb-text)] rounded-[var(--nb-radius-badge)] hover:opacity-80 transition-opacity cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            style={{
              boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
            }}
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 text-[var(--nb-text)]">{children}</div>
      </div>
    </div>
  );
};
