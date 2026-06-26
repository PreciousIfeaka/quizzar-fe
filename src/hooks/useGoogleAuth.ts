import { useEffect, useRef, useCallback } from 'react';

// Module-level guard: ensure the GIS script is only injected once, and
// all pending callbacks are flushed when the script eventually loads.
let gsiScriptLoaded = false;
const pendingCallbacks: Array<() => void> = [];

function loadGsiScript(onReady: () => void) {
  if (gsiScriptLoaded) {
    // Script already fully loaded — call immediately.
    onReady();
    return;
  }

  // Queue the callback regardless of whether the tag already exists.
  pendingCallbacks.push(onReady);

  if (!document.getElementById('google-gsi-script')) {
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gsiScriptLoaded = true;
      // Drain the queue so every waiting caller gets notified.
      pendingCallbacks.splice(0).forEach((cb) => cb());
    };
    script.onerror = () => {
      // Script blocked (ad blocker etc.) — drain queue silently.
      pendingCallbacks.splice(0);
    };
    document.body.appendChild(script);
  }
  // If the tag already exists but hasn't fired onload yet, the callback is
  // already queued above and will be called when onload fires.
}

interface UseGoogleAuthOptions {
  /** Called with the raw ID token after a successful Google sign-in. */
  onCredential: (idToken: string) => void;
  /** Called when the Google SDK is not available (e.g. blocked by ad blocker). */
  onBlocked?: () => void;
}

/**
 * Loads the Google Identity Services script once (module-level singleton)
 * and exposes a `promptGoogle()` function that opens the One Tap / popup.
 *
 * Key design decisions:
 * - `initialize()` is re-called on each page mount so the callback always
 *   points to the current page's handler. GIS warns about this in dev but
 *   the last init wins, which is correct.
 * - We use `ux_mode: 'popup'` instead of `renderButton`, avoiding the
 *   invisible-iframe overlay technique that caused dead-click regions.
 * - The `onCredential` reference is kept fresh via a ref so re-renders
 *   don't cause stale closure bugs.
 */
export function useGoogleAuth({ onCredential, onBlocked }: UseGoogleAuthOptions) {
  // Keep the latest callback stable via a ref.
  const onCredentialRef = useRef(onCredential);
  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      const google = (window as any).google;
      if (!google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: (response: any) => {
          const idToken = response?.credential;
          if (idToken) onCredentialRef.current(idToken);
        },
        ux_mode: 'popup',
        cancel_on_tap_outside: false,
      });
    };

    loadGsiScript(init);

    return () => {
      cancelled = true;
    };
  }, []);

  const promptGoogle = useCallback(() => {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      onBlocked?.();
      return;
    }
    google.accounts.id.prompt();
  }, [onBlocked]);

  return { promptGoogle };
}
