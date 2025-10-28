export type Interaction = {
  id: number;
  name: string;
  timestamp: number;
};

export function unstable_trace<T>(name: string, timestamp: number, callback: () => T): T;
export function unstable_wrap<T extends (...args: any[]) => any>(callback: T): T;
export function unstable_getCurrent(): Interaction[];
