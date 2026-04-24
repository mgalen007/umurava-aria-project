import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { AppError } from './error';

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.csv', '.xls', '.xlsx']);
const UPLOAD_DIR = path.join(os.tmpdir(), 'aria-uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const baseName = path
        .basename(file.originalname, extension)
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase() || 'upload';
      cb(null, `${Date.now()}-${baseName}${extension}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 50,
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(extension)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `Unsupported file type: ${file.mimetype || 'unknown'} (${extension || 'no extension'})`,
          400,
        ),
      );
    }
  },
});
