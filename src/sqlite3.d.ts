declare module 'sqlite3' {
  export interface RunResult {
    lastID: number;
    changes: number;
  }

  export class Database {
    constructor(filename: string, callback?: (err: Error | null) => void);
    constructor(filename: string, mode?: number, callback?: (err: Error | null) => void);

    run(sql: string, callback?: (this: RunResult, err: Error | null) => void): this;
    run(sql: string, params: any, callback?: (this: RunResult, err: Error | null) => void): this;

    get(sql: string, callback?: (err: Error | null, row: any) => void): this;
    get(sql: string, params: any, callback?: (err: Error | null, row: any) => void): this;

    all(sql: string, callback?: (err: Error | null, rows: any[]) => void): this;
    all(sql: string, params: any, callback?: (err: Error | null, rows: any[]) => void): this;

    exec(sql: string, callback?: (err: Error | null) => void): this;

    close(callback?: (err: Error | null) => void): void;
  }

  export function verbose(): { Database: typeof Database; verbose: typeof verbose };
}
