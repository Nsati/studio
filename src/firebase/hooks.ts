
'use client';
import { useMemo, type DependencyList } from 'react';

/**
 * A custom hook to memoize Firebase query or document references.
 *
 * This hook is essential for preventing infinite re-render loops when using
 * `useDoc` or `useCollection`. Firestore query/doc objects are created on
 * every render by default. This hook ensures that the reference object is
 * only recreated when its dependencies change.
 *
 * It also "tags" the returned reference with a `__memo` property, which
 * `useDoc` and `useCollection` can check for to provide helpful development
 * warnings if a reference is not memoized.
 *
 * @param factory A function that returns a Firestore query or document reference.
 * @param deps A dependency array, similar to `useMemo`.
 * @returns The memoized Firebase reference.
 */
export function useMemoFirebase<T>(
  factory: () => T | null,
  deps: DependencyList
): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result = useMemo(factory, deps);

  if (result) {
    // @ts-ignore - This is a custom property for our internal checks.
    result.__memo = true;
  }
  return result;
}
