declare module '@playwright/test' {
  export const test: any;
  export const expect: any;
  export type Page = any;
  export const devices: Record<string, unknown>;
  export function defineConfig(config: unknown): unknown;
}
