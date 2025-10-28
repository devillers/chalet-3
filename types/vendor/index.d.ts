// Minimal ambient declarations to satisfy third-party types missing in the audit environment.

declare module 'react' {
  export function captureOwnerStack(error: Error): string;
  export type ActionDispatch<A extends unknown[]> = (...args: A) => void;
}

declare global {
  interface RequestInit {
    priority?: 'high' | 'low' | 'auto';
  }

  type MapIterator<T> = IterableIterator<T>;
  type HeadersIterator<T> = IterableIterator<T>;
}

export {};
