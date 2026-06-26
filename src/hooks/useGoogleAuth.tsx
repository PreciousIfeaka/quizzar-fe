import { useGoogleLogin } from '@react-oauth/google';

interface UseGoogleAuthOptions {
  onCredential: (idToken: string) => void;
  onError?: () => void;
}

export function useGoogleAuth({ onCredential, onError }: UseGoogleAuthOptions) {
  const triggerGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        onCredential(tokenResponse.access_token);
      } else {
        onError?.();
      }
    },
    onError: () => onError?.(),
    onNonOAuthError: () => onError?.(),
  });

  return { triggerGoogleLogin };
}
