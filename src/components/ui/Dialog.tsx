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
        className={`relative w-full max-w-lg bg-[var(--nb-surface)] border-[4px] border-[var(--nb-border)] overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 ${className}`}
        style={{ boxShadow: `8px 8px 0px 0px var(--nb-shadow-yellow)` }}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 bg-[var(--nb-yellow)] border-b-[3px] border-[var(--nb-border)] shrink-0">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[var(--nb-text-on-accent)] m-0">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border-[2px] border-[var(--nb-border)] bg-[var(--nb-surface)] hover:bg-[var(--nb-dark-bg)] hover:text-[var(--nb-dark-text)] transition-colors cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            style={{ boxShadow: `2px 2px 0px 0px var(--nb-shadow)` }}
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
