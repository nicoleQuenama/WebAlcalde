
declare module 'node:sqlite' {
  export interface StatementSync {
    run(...params: unknown[]): unknown;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  export interface DatabaseSync {
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }

  export function DatabaseSync(pathOrInMemory: string | ':memory:'): DatabaseSync;
}

declare module 'node:fs' {
  export function existsSync(path: string): boolean;
  export function mkdirSync(
    path: string,
    options?: { recursive?: boolean },
  ): string | undefined;
}

declare module 'node:path' {
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
}
