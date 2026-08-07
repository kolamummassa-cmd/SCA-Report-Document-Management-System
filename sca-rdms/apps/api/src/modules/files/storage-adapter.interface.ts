/**
 * Storage abstraction so the rest of the app never talks to the filesystem
 * or S3/R2 directly. Swapping providers (per the SRS: local disk in dev,
 * S3-compatible in prod) is a config change, not a rewrite — see
 * System Architecture doc, section 2.5.
 */

export interface StoredObjectMeta {
  storageKey: string;
  sizeBytes: number;
}

export interface StorageAdapter {
  /** Persists a buffer under a unique key and returns where it landed. */
  put(key: string, data: Buffer): Promise<StoredObjectMeta>;

  /** Retrieves the full contents of a stored object. */
  get(key: string): Promise<Buffer>;

  /** Removes a stored object. Safe to call on a missing key (no-op). */
  delete(key: string): Promise<void>;
}
