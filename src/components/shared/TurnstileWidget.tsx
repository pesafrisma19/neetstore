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

  const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '';

  // 1. Inject Cloudflare Turnstile script dynamically
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
        if (onError) onError();
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, [siteKey, onError]);

  // 2. Render Widget saat script dan container siap
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !siteKey || !window.turnstile) {
      return;
    }

    // Bersihkan widget lama jika ada
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
          onSuccess(token);
        },
        'error-callback': () => {
          console.warn('[Turnstile] Tantangan Turnstile mengalami error.');
          if (onError) onError();
        },
        'expired-callback': () => {
          console.warn('[Turnstile] Token Turnstile telah kadaluarsa.');
          if (onExpire) onExpire();
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
  }, [scriptLoaded, siteKey, action, resetKey, onSuccess, onError, onExpire]);

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
