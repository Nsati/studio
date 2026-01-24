'use client';

import { useMemo } from 'react';

/**
 * A custom hook that memoizes a Firebase query or reference and tags it
 * to ensure it's being used correctly with useCollection and useDoc.
 * Firebase query and collection functions return new instances on every call,
 * so they must be memoized to avoid infinite re-renders.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(() => {
    const value = factory();
    if (value && typeof value === 'object') {
      // Add a hidden property to mark it as properly memoized
      Object.defineProperty(value, '__memo', {
        value: true,
        enumerable: false,
        configurable: true,
      });
    }
    return value;
  }, deps);
}
