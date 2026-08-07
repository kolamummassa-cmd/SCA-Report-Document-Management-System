import { randomUUID, createHash } from "crypto";
import { extname } from "path";
import { LocalDiskAdapter } from "./local-disk.adapter";
import type { StorageAdapter } from "./storage-adapter.interface";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error-handler";

// Per SRS: PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX, images, videos, ZIP.
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".ppt",
  ".pptx",
  ".zip",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".mp4",
  ".mov",
  ".webm",
]);

// Magic-byte-detectable MIME types we accept, keyed by the `file-type`
// library's output. CSV/plain-text has no reliable magic number, so it's
// validated by extension + a UTF-8 sanity check instead (see below).
const ALLOWED_SNIFFED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const TEXT_LIKE_EXTENSIONS = new Set([".csv"]);

let storageAdapter: StorageAdapter | null = null;
function getStorageAdapter(): StorageAdapter {
  if (!storageAdapter) {
    // STORAGE_PROVIDER "s3"/"r2" would return an S3-compatible adapter here
    // once implemented — see System Architecture doc, section 2.5.
    storageAdapter = new LocalDiskAdapter();
  }
  return storageAdapter;
}

export interface IncomingFile {
  originalName: string;
  buffer: Buffer;
  mimeTypeHint: string; // as reported by the client — never trusted alone
}

async function assertFileIsSafe(file: IncomingFile) {
  const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
  if (file.buffer.byteLength > maxBytes) {
    throw new AppError(`File exceeds the ${env.MAX_UPLOAD_SIZE_MB}MB upload limit.`, 413);
  }

  const ext = extname(file.originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new AppError(`File type "${ext}" is not permitted.`, 415);
  }

  if (TEXT_LIKE_EXTENSIONS.has(ext)) {
    // No reliable magic number for CSV/plain text — just confirm it's
    // valid, non-binary UTF-8 rather than e.g. a renamed executable.
    const sample = file.buffer.subarray(0, 4096).toString("utf8");
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x08\x0E-\x1F]/.test(sample)) {
      throw new AppError("File does not look like valid CSV/text content.", 415);
    }
    return;
  }

  // Dynamic import: `file-type` ships as an ESM-only package.
  const { fileTypeFromBuffer } = await import("file-type");
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected || !ALLOWED_SNIFFED_MIME_TYPES.has(detected.mime)) {
    throw new AppError(
      "File content does not match an allowed file type (extension/content mismatch).",
      415
    );
  }
}

export const filesService = {
  /**
   * Validates, stores, and records a single uploaded file. Returns the
   * created `File` row — callers (reports/documents modules) link it to
   * the owning entity.
   */
  async storeUpload(file: IncomingFile, uploadedById: string) {
    await assertFileIsSafe(file);

    const checksum = createHash("sha256").update(file.buffer).digest("hex");
    const ext = extname(file.originalName).toLowerCase();
    const storageKey = `${uploadedById}/${randomUUID()}${ext}`;

    const adapter = getStorageAdapter();
    await adapter.put(storageKey, file.buffer);

    return prisma.file.create({
      data: {
        originalName: file.originalName,
        storageKey,
        mimeType: file.mimeTypeHint,
        sizeBytes: BigInt(file.buffer.byteLength),
        checksumSha256: checksum,
        storageProvider: env.STORAGE_PROVIDER === "local" ? "LOCAL" : env.STORAGE_PROVIDER === "s3" ? "S3" : "R2",
        uploadedById,
      },
    });
  },

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    return getStorageAdapter().get(storageKey);
  },

  async findById(id: string) {
    return prisma.file.findUnique({ where: { id } });
  },
};
