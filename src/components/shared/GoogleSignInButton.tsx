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
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

// Module-level state agar initialize() hanya dipanggil 1 kali per Client ID di seluruh lifecycle SPA
let initializedClientId: string | null = null;
let activeSuccessCallback: ((credential: string) => void) | null = null;
let activeErrorCallback: ((errorMessage: string) => void) | null = null;

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

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    activeSuccessCallback = onSuccess;
    activeErrorCallback = onError || null;
  });

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // 1. Load Google Identity Services script secara dinamis (Hanya sekali di app)
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
        onErrorRef.current?.('Gagal memuat modul Google Sign-In');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, [clientId]);

  // 2. Render Google Button sekali saat script dan container siap
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.google?.accounts?.id || !clientId) {
      return;
    }

    // A. Pastikan initialize() HANYA dipanggil 1 kali seumur hidup aplikasi SPA
    if (initializedClientId !== clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            activeSuccessCallback?.(response.credential);
          } else {
            console.warn('[Google GIS] Credential tidak diterima.');
            activeErrorCallback?.('Tidak ada kredensial Google yang diterima');
          }
        },
      });
      initializedClientId = clientId;
    }

    // B. Hitung lebar kontainer dalam pixel valid (Google GIS membatasi 200px - 400px) sekali saat mount
    const rawWidth = containerRef.current.clientWidth || 360;
    const validWidth = Math.max(200, Math.min(400, Math.floor(rawWidth)));

    // Bersihkan kontainer sebelum render pertama kali
    containerRef.current.innerHTML = '';

    try {
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: validWidth, // Menggunakan integer pixel valid (200 - 400), BUKAN "100%"
        locale: 'id',
      });
    } catch (err) {
      console.error('[Google Button Render Error]:', err);
    }

    return () => {
      if (activeSuccessCallback === onSuccessRef.current) {
        activeSuccessCallback = null;
      }
      if (activeErrorCallback === onErrorRef.current) {
        activeErrorCallback = null;
      }
    };
  }, [scriptLoaded, clientId, text]);

  if (errorNotice) {
    return (
      <div className="p-3 bg-amber-100 border-2 border-amber-500 rounded-lg text-amber-900 font-bold text-xs text-center">
        ℹ️ {errorNotice}
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <div
        ref={containerRef}
        className="w-full flex justify-center min-h-[44px] max-w-[400px] overflow-hidden"
      />
    </div>
  );
};
