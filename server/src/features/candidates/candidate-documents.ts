import fs from 'fs';
import fsPromises from 'fs/promises';
import os from 'os';
import path from 'path';
import type { CandidateSourceDocument } from './candidates.types';

const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'aria-uploads');
const PERSISTED_DOCUMENTS_DIR = path.resolve(process.cwd(), 'uploads', 'candidate-documents');

fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PERSISTED_DOCUMENTS_DIR, { recursive: true });

export function getTemporaryUploadDir() {
  return TEMP_UPLOAD_DIR;
}

export function getPersistedDocumentsDir() {
  return PERSISTED_DOCUMENTS_DIR;
}

export async function persistUploadedDocument(file: Express.Multer.File): Promise<CandidateSourceDocument> {
  const targetPath = path.join(PERSISTED_DOCUMENTS_DIR, path.basename(file.path));

  await fsPromises.rename(file.path, targetPath);

  return {
    originalName: file.originalname,
    storedName: path.basename(targetPath),
    mimeType: file.mimetype,
    extension: path.extname(file.originalname).toLowerCase(),
    path: targetPath,
    size: file.size,
  };
}

export async function deleteStoredDocument(filePath?: string) {
  if (!filePath) return;

  try {
    await fsPromises.unlink(filePath);
  } catch {
    // Ignore cleanup failures for already-removed files.
  }
}
