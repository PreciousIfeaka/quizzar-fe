import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion() {
  const shouldReduce = useFramerReducedMotion();
  return shouldReduce ?? false;
}
