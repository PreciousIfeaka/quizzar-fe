import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(
  initialSeconds: number,
  onExpire: () => void,
  autoStart = true
) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onExpire]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    stop();
    setSeconds(newSeconds ?? initialSeconds);
  }, [stop, initialSeconds]);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, []);

  const percentage = (seconds / initialSeconds) * 100;
  const isUrgent = seconds <= Math.min(10, initialSeconds * 0.2);

  return { seconds, percentage, isUrgent, start, stop, reset };
}
