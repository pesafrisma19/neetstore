import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (errorMessage: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // 1. Load Google Identity Services script
  useEffect(() => {
    if (!clientId) {
      if (import.meta.env.DEV) {
        setErrorNotice('VITE_GOOGLE_CLIENT_ID belum dikonfigurasi di .env');
      }
      return;
    }

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const SCRIPT_ID = 'google-gsi-client-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('[Google GIS] Gagal memuat script Google Identity Services.');
        if (onError) onError('Gagal memuat modul Google Sign-In');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, [clientId, onError]);

  // 2. Initialize & Render Google Button
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !clientId || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            console.warn('[Google GIS] Credential tidak diterima.');
            if (onError) onError('Tidak ada kredensial Google yang diterima');
          }
        },
      });

      // Bersihkan container sebelum render ulang
      containerRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'center',
        width: '100%',
        locale: 'id',
      });
    } catch (err: any) {
      console.error('[Google Button Render Error]:', err);
    }
  }, [scriptLoaded, clientId, text, onSuccess, onError]);

  if (errorNotice) {
    return (
      <div className="p-3 bg-amber-100 border-2 border-amber-500 rounded-lg text-amber-900 font-bold text-xs text-center">
        ℹ️ {errorNotice}
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <div ref={containerRef} className="w-full flex justify-center min-h-[44px]" />
    </div>
  );
};
