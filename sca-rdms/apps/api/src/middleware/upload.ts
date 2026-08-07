import multer from "multer";
import { env } from "../config/env";

/**
 * Shared multer instance for both the Reports and Documents modules.
 * Uses memory storage (not disk) because `filesService.storeUpload` does
 * its own MIME-sniffing + checksum + storage-adapter write — buffering in
 * memory keeps that single code path in control of validation regardless
 * of which module is uploading.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
});
