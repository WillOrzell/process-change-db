declare module 'better-sqlite3' {
  namespace BetterSqlite3 {
    interface Database {
      prepare(sql: string): Statement;
      exec(sql: string): this;
      transaction<T>(fn: (...args: any[]) => T): (...args: any[]) => T;
      pragma(pragma: string, simplify?: boolean): any;
      checkpoint(databaseName?: string): this;
      function(name: string, fn: (...args: any[]) => any): this;
      aggregate(name: string, options: { start?: any, step: (...args: any[]) => any, result?: (...args: any[]) => any }): this;
      loadExtension(path: string): this;
      close(): this;
      defaultSafeIntegers(toggleState?: boolean): this;
      backup(destination: string | Database, options?: { attached?: string, progress?: (progress: { totalPages: number; remainingPages: number }) => number | void }): Promise<void>;
    }

    interface Statement {
      run(...params: any[]): RunResult;
      get(...params: any[]): any;
      all(...params: any[]): any[];
      iterate(...params: any[]): IterableIterator<any>;
      pluck(toggleState?: boolean): this;
      expand(toggleState?: boolean): this;
      raw(toggleState?: boolean): this;
      columns(): ColumnDefinition[];
      bind(...params: any[]): this;
    }

    interface ColumnDefinition {
      name: string;
      column: string | null;
      table: string | null;
      database: string | null;
      type: string | null;
    }

    interface RunResult {
      changes: number;
      lastInsertRowid: number | bigint;
    }
  }

  interface BetterSqlite3Database extends BetterSqlite3.Database {}

  function Database(filename: string, options?: {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (message?: any, ...additionalArgs: any[]) => void;
    nativeBinding?: string;
  }): BetterSqlite3Database;

  export = Database;
} 