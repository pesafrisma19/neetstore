import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          action?: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

interface TurnstileWidgetProps {
  action?: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  resetKey?: number;
  className?: string;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  action,
  onSuccess,
  onError,
  onExpire,
  resetKey,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Simpan referensi callback terbaru menggunakan useRef agar perubahan referential identity dari parent
  // TIDAK memicu penghancuran (cleanup) dan pembuatan ulang (re-render) iframe Turnstile.
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  });

  const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '';

  // 1. Inject Cloudflare Turnstile script secara dinamis (Hanya sekali, tanpa dependensi callback parent)
  useEffect(() => {
    if (!siteKey) {
      if (import.meta.env.DEV) {
        console.warn('[Turnstile Notice] VITE_CLOUDFLARE_TURNSTILE_SITE_KEY belum diisi. Turnstile dilewati (Dev Mode).');
      }
      return;
    }

    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    const SCRIPT_ID = 'cf-turnstile-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('[Turnstile] Gagal memuat script Cloudflare Turnstile.');
        onErrorRef.current?.();
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, [siteKey]);

  // 2. Render Widget saat script dan container siap (Hanya bergantung pada parameter esensial)
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !siteKey || !window.turnstile) {
      return;
    }

    // Bersihkan widget lama hanya jika memang terjadi re-init yang disengaja (misal resetKey berubah)
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme: 'auto',
        size: 'normal',
        callback: (token: string) => {
          onSuccessRef.current(token);
        },
        'error-callback': (errorCode?: string) => {
          console.warn('[Turnstile] Tantangan Turnstile mengalami error code:', errorCode || 'UNKNOWN');
          onErrorRef.current?.();
        },
        'expired-callback': () => {
          console.warn('[Turnstile] Token Turnstile telah kadaluarsa.');
          onExpireRef.current?.();
        },
      });

      widgetIdRef.current = widgetId;
    } catch (err) {
      console.error('[Turnstile Render Error]:', err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey, action, resetKey]);

  // Jika sitekey belum diset (misal dev lokal awal), jangan render apapun
  if (!siteKey) {
    return null;
  }

  return (
    <div className={`flex justify-center my-2 ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
    </div>
  );
};
