import { useRef, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface UseGoogleAuthOptions {
  /** Called with the raw ID token after a successful Google sign-in. */
  onCredential: (idToken: string) => void;
  /** Called when the Google sign-in fails or is dismissed. */
  onError?: () => void;
}

/**
 * Uses the official GoogleLogin component from @react-oauth/google rendered
 * as a visually-hidden element. Clicking the custom button programmatically
 * clicks the hidden Google button via a ref, which opens the Google sign-in
 * popup and returns a credential (id_token) directly.
 *
 * This approach:
 * - Requires zero manual GIS SDK calls
 * - Works with any custom button design
 * - Is not affected by ad blockers any more than the standard Google button
 * - Returns an id_token so the backend needs no changes
 */
export function useGoogleAuth({ onCredential, onError }: UseGoogleAuthOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerGoogleLogin = useCallback(() => {
    // Find the iframe/div rendered by GoogleLogin inside the hidden container
    // and programmatically click it to open the Google popup.
    const btn = containerRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
    if (btn) {
      btn.click();
    } else {
      // Fallback: click anything clickable inside the container
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
            console.error('[useGoogleAuth] No credential in response');
            onError?.();
          }
        }}
        onError={() => {
          console.error('[useGoogleAuth] Google sign-in failed');
          onError?.();
        }}
        useOneTap={false}
        type="standard"
        size="large"
      />
    </div>
  );

  return { triggerGoogleLogin, hiddenButton };
}
