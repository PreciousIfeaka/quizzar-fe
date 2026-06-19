// src/lib/env.ts
// Centralises all environment variable access.
// Throws a clear error at startup if a required variable is missing.

function requireEnv(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value || value.trim() === '') {
    throw new Error(
      `[Quizzar] Missing required environment variable: ${key}\n` +
      `Add it to your .env.local file.`
    );
  }
  return value.trim();
}

function optionalEnv(key: string, fallback: string): string {
  const value = import.meta.env[key] as string | undefined;
  return value?.trim() || fallback;
}

export const env = {
  apiBaseUrl:       requireEnv('VITE_API_BASE_URL'),

  publicQuizBase:   optionalEnv('VITE_PUBLIC_QUIZ_BASE_URL', `${window.location.origin}/quiz`),
  isDev:            import.meta.env.DEV,
  isProd:           import.meta.env.PROD,
} as const;
