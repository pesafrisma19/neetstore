import React from 'react';
import { FaCircleCheck, FaCircleExclamation, FaTriangleExclamation, FaCircleInfo, FaXmark } from 'react-icons/fa6';

export interface ToastMessage {
  id?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (!toast) return null;

  const getToneStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-[var(--nb-mint)]',
          shadowColor: 'var(--nb-shadow-mint)',
          icon: <FaCircleCheck className="w-5 h-5 text-[var(--nb-text-on-accent)] shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-[var(--nb-pink)]',
          shadowColor: 'var(--nb-shadow-pink)',
          icon: <FaCircleExclamation className="w-5 h-5 text-[var(--nb-text-on-accent)] shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-[var(--nb-yellow)]',
          shadowColor: 'var(--nb-shadow-yellow)',
          icon: <FaTriangleExclamation className="w-5 h-5 text-[var(--nb-text-on-accent)] shrink-0" />,
        };
      default:
        return {
          bg: 'bg-[var(--nb-cyan)]',
          shadowColor: 'var(--nb-shadow-cyan)',
          icon: <FaCircleInfo className="w-5 h-5 text-[var(--nb-text-on-accent)] shrink-0" />,
        };
    }
  };

  const tone = getToneStyles();

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300 max-w-sm w-full">
      <div
        className={`p-4 ${tone.bg} border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-element)] flex items-start gap-3 relative text-[var(--nb-text-on-accent)]`}
        style={{
          boxShadow: `var(--nb-shadow-lg-x) var(--nb-shadow-lg-y) var(--nb-shadow-blur) var(--nb-shadow-spread) ${tone.shadowColor}`,
        }}
      >
        {tone.icon}
        <div className="flex-1 text-left">
          <h4 className="font-black text-xs uppercase tracking-tight m-0 text-[var(--nb-text-on-accent)]">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-[11px] font-bold mt-1 text-[var(--nb-text-on-accent)]/90 leading-tight m-0">
              {toast.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 bg-[var(--nb-surface)] text-[var(--nb-text)] border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] hover:opacity-80 transition-opacity cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
          style={{
            boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
          }}
          aria-label="Tutup notifikasi"
        >
          <FaXmark className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
