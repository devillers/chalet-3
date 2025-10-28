declare module '@playwright/test' {
  export type Page = any;
  export interface TestFixtures {
    page: Page;
    browserName?: string;
    [key: string]: any;
  }

  export const test: {
    (name: string, fn: (fixtures: TestFixtures) => any): void;
    describe: (...args: any[]) => any;
    beforeEach: (...args: any[]) => any;
    afterEach: (...args: any[]) => any;
  };

  export const expect: any;
  export const devices: Record<string, any>;
  export function defineConfig(config: unknown): unknown;
}
