import { useRef, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface UseGoogleAuthOptions {
  onCredential: (idToken: string) => void;
  onError?: () => void;
}

export function useGoogleAuth({ onCredential, onError }: UseGoogleAuthOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerGoogleLogin = useCallback(() => {
    const btn = containerRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
    if (btn) {
      btn.click();
    } else {
      const anyClickable = containerRef.current?.querySelector('[tabindex]') as HTMLElement | null;
      anyClickable?.click();
    }
  }, []);

  const hiddenButton = (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
      }}
      aria-hidden="true"
    >
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const idToken = credentialResponse.credential;
          if (idToken) {
            onCredential(idToken);
          } else {
            onError?.();
          }
        }}
        onError={() => onError?.()}
        useOneTap={false}
        type="standard"
        size="large"
      />
    </div>
  );

  return { triggerGoogleLogin, hiddenButton };
}
