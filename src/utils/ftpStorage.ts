import multer from 'multer';
import os from 'os';
import crypto from 'crypto';
import path from 'path';

/**
 * Temporary local disk storage for Multer.
 * Files are uploaded here first, and then the controller pushes them via StorageService (SFTP).
 * This ensures the database transaction and file upload are atomic.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// We keep the export names the same to avoid breaking route imports,
// but they now act as temporary disk storage.
export const ftpStorage = storage;
export const uploadFtp = multer({ storage });
export const upload = multer({ storage });
