declare module 'next' {
  export interface NextApiRequest extends Record<string, any> {}
  export interface NextApiResponse<T = any> {
    status(code: number): NextApiResponse<T>;
    json(body: T): void;
    [key: string]: any;
  }

  export type Metadata = any;
  export namespace MetadataRoute {
    export type Robots = any;
    export type Sitemap = any;
  }
}

export {};
