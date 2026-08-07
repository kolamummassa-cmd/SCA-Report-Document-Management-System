import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import { dirname, join } from "path";
import { env } from "../../config/env";
import type { StorageAdapter, StoredObjectMeta } from "./storage-adapter.interface";

/**
 * Development storage adapter — writes under STORAGE_LOCAL_PATH.
 * Production swaps this for an S3-compatible adapter (AWS S3 / Cloudflare R2)
 * implementing the same interface; nothing above this layer changes.
 */
export class LocalDiskAdapter implements StorageAdapter {
  private readonly basePath: string;

  constructor(basePath: string = env.STORAGE_LOCAL_PATH) {
    this.basePath = basePath;
  }

  private resolvePath(key: string): string {
    // `key` is always a server-generated random path segment (never derived
    // from user input) — see files.service.ts — so there's no path-traversal
    // risk from untrusted filenames.
    return join(this.basePath, key);
  }

  async put(key: string, data: Buffer): Promise<StoredObjectMeta> {
    const fullPath = this.resolvePath(key);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, data);
    return { storageKey: key, sizeBytes: data.byteLength };
  }

  async get(key: string): Promise<Buffer> {
    return readFile(this.resolvePath(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.resolvePath(key));
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }
}
