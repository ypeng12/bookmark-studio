
import { AppConstants } from '../core/constants';
import { DatabaseFailure } from '../core/errors';
import { FileModel } from './models';
import { SearchResultEntity } from '../domain/entities';

export class AppDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AppConstants.db.name, AppConstants.db.version);

      request.onerror = () => reject(new DatabaseFailure('Failed to open database'));
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Files Table
        if (!db.objectStoreNames.contains(AppConstants.db.tables.files)) {
          const store = db.createObjectStore(AppConstants.db.tables.files, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }

        // Search Cache Table
        if (!db.objectStoreNames.contains(AppConstants.db.tables.searchCache)) {
          db.createObjectStore(AppConstants.db.tables.searchCache, { keyPath: 'query' });
        }
      };
    });
  }

  // Fix: Removed return to satisfy Promise<void> since performTransaction returns IDBValidKey from store.put
  async saveFile(file: FileModel): Promise<void> {
    if (!this.db) await this.init();
    await this.performTransaction(AppConstants.db.tables.files, 'readwrite', (store) => store.put(file));
  }

  async getAllFiles(): Promise<FileModel[]> {
    if (!this.db) await this.init();
    return this.performTransaction(AppConstants.db.tables.files, 'readonly', (store) => store.getAll());
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init();
    return this.performTransaction(AppConstants.db.tables.files, 'readwrite', (store) => store.delete(id));
  }

  // Fix: Removed return to satisfy Promise<void> since performTransaction returns IDBValidKey from store.put
  async saveSearchCache(result: SearchResultEntity): Promise<void> {
    if (!this.db) await this.init();
    await this.performTransaction(AppConstants.db.tables.searchCache, 'readwrite', (store) => store.put(result));
  }

  async getSearchCache(query: string): Promise<SearchResultEntity | undefined> {
    if (!this.db) await this.init();
    return this.performTransaction(AppConstants.db.tables.searchCache, 'readonly', (store) => store.get(query));
  }

  private async performTransaction<T>(
    storeName: string, 
    mode: IDBTransactionMode, 
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new DatabaseFailure(request.error?.message || 'Transaction failed'));
    });
  }
}

export const appDatabase = new AppDatabase();
