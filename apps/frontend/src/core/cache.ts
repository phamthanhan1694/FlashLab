/** Large snapshots use structured clones in IndexedDB, never synchronous Web Storage. */
export class BrowserCache {
  private connection?: Promise<IDBDatabase>;
  constructor(private factory = () => globalThis.indexedDB) {}

  private open() {
    return (this.connection ??= new Promise<IDBDatabase>((resolve, reject) => {
      const factory = this.factory();
      if (!factory) return reject(new Error('IndexedDB is unavailable'));
      const request = factory.open('flashlab', 1);
      let blocked = false;
      request.onupgradeneeded = () => request.result.createObjectStore('cache');
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        blocked = true;
        reject(new Error('IndexedDB upgrade is blocked'));
      };
      request.onsuccess = () => {
        const db = request.result;
        if (blocked) {
          db.close();
          return;
        }
        db.onclose = () => {
          this.connection = undefined;
        };
        db.onversionchange = () => {
          db.close();
          this.connection = undefined;
        };
        resolve(db);
      };
    }).catch((error) => {
      this.connection = undefined;
      throw error;
    }));
  }

  private async transact<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ) {
    const db = await this.open();
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction('cache', mode);
      const request = operation(transaction.objectStore('cache'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () =>
        reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
      transaction.onerror = () => reject(transaction.error ?? request.error);
    });
  }

  async read<T = unknown>(key: string): Promise<T | undefined> {
    let existing: T | undefined;
    let failure: unknown;
    try {
      existing = await this.transact('readonly', (store) => store.get(key));
    } catch (error) {
      failure = error;
    }
    if (existing !== undefined) return existing;
    // Import old browser data once. Remove it only after the IDB transaction commits.
    let legacy: string | null = null;
    try {
      legacy = localStorage.getItem(key);
    } catch {
      /* Web Storage may be blocked. */
    }
    if (legacy !== null) {
      const value = JSON.parse(legacy) as T;
      try {
        await this.write(key, value);
        localStorage.removeItem(key);
      } catch {
        /* Keep the original available when migration cannot commit. */
      }
      return value;
    }
    if (failure) throw failure;
    return undefined;
  }

  async write(key: string, value: unknown) {
    await this.transact('readwrite', (store) => store.put(value, key));
  }

  async remove(key: string) {
    await this.transact('readwrite', (store) => store.delete(key));
    try {
      localStorage.removeItem(key);
    } catch {
      /* May already be absent. */
    }
  }

  async close() {
    const connection = this.connection;
    this.connection = undefined;
    if (connection) (await connection.catch(() => undefined))?.close();
  }
}

export const browserCache = new BrowserCache();
