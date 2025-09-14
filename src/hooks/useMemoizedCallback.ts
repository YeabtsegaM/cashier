'use client';

import { useCallback, useRef } from 'react';

/**
 * Custom hook for memoized callbacks with dependency tracking
 * This helps prevent unnecessary re-renders and improves performance
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: any[]) => {
      return callbackRef.current(...args);
    }) as T,
    dependencies
  );
}

/**
 * Hook for memoizing expensive computations
 * Useful for filtering, sorting, or transforming large datasets
 */
export function useMemoizedValue<T>(
  computeValue: () => T,
  dependencies: any[]
): T {
  const valueRef = useRef<T | undefined>(undefined);
  const depsRef = useRef<any[] | undefined>(undefined);

  // Check if dependencies have changed
  const hasChanged = !depsRef.current || 
    depsRef.current.length !== dependencies.length ||
    depsRef.current.some((dep, index) => dep !== dependencies[index]);

  if (hasChanged) {
    valueRef.current = computeValue();
    depsRef.current = dependencies;
  }

  return valueRef.current!;
} 