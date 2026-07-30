import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Toast } from './Toast';
import type { ToastMessage } from './Toast';

interface ToastContextType {
  addToast: (toast: ToastMessage) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const addToast = (newToast: ToastMessage) => {
    setToast(newToast);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
