import fs from 'fs/promises';
import { Candidate } from './candidates.model';
import { CreateCandidateDto, IngestCandidateDto, UpdateCandidateDto } from './candidates.dto';
import { ICandidate } from './candidates.types';
import { AppError } from '../../middleware/error';
import { NormalizeService } from '../../ai/normalize.service'

const normalizeService = new NormalizeService()

export class CandidatesService {

  async create(data: CreateCandidateDto, uploadedBy: string) {
    return this.createCandidate(data, uploadedBy, 'manual_entry');
  }

  private async createCandidate(
    data: CreateCandidateDto | IngestCandidateDto,
    uploadedBy: string,
    source: 'manual_entry' | 'pdf_resume' | 'csv_upload'
  ) {
    const existing = await Candidate.findOne({ email: data.email });
    if (existing) throw new AppError('A candidate with this email already exists', 409);

    const candidate = await Candidate.create({
      ...data,
      source,
      uploadedBy,
      extractionConfidence: 1,
    });

    return candidate;
  }

  async findAll(uploadedBy: string) {
    const candidates = await Candidate.find({ uploadedBy })
      .select('-evaluationHistory')
      .sort({ createdAt: -1 });
    return candidates;
  }

  async findOne(id: string, uploadedBy: string) {
    const candidate = await Candidate.findOne({ _id: id, uploadedBy });
    if (!candidate) throw new AppError('Candidate not found', 404);
    return candidate;
  }

  async update(id: string, data: UpdateCandidateDto, uploadedBy: string) {
    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, uploadedBy },
      data,
      { new: true }
    );
    if (!candidate) throw new AppError('Candidate not found', 404);
    return candidate;
  }

  async remove(id: string, uploadedBy: string) {
    const candidate = await Candidate.findOneAndDelete({ _id: id, uploadedBy });
    if (!candidate) throw new AppError('Candidate not found', 404);
  }

  async search(query: string, uploadedBy: string) {
    const candidates = await Candidate.find({
      uploadedBy,
      $text: { $search: query },
    }).select('-evaluationHistory');
    return candidates;
  }

  async ingestPDFs(files: Express.Multer.File[], uploadedBy: string) {
    const succeeded: ICandidate[] = [];
    const failed: string[] = [];

    for (const file of files) {
      try {
        const buffer = await fs.readFile(file.path);
        const data = await normalizeService.fromPDF(buffer);
        const candidate = await this.createCandidate(data, uploadedBy, 'pdf_resume');
        succeeded.push(candidate);
      } catch (error) {
        failed.push(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        await this.cleanupUploadedFile(file.path);
      }
    }

    return { succeeded, failed };
  }

  async ingestCSV(file: Express.Multer.File, uploadedBy: string) {
    try {
      const buffer = await fs.readFile(file.path);
      const rows = file.mimetype === 'text/csv'
        ? await normalizeService.fromCSV(buffer)
        : await normalizeService.fromExcel(buffer);

      const results = await Promise.allSettled(
        rows.map((data) => this.createCandidate(data, uploadedBy, 'csv_upload'))
      );

      const succeeded = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value);

      const failed = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => r.reason?.message ?? 'Unknown error');

      return { succeeded, failed };
    } finally {
      await this.cleanupUploadedFile(file.path);
    }
  }

  private async cleanupUploadedFile(filePath?: string) {
    if (!filePath) return;

    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore cleanup failures for already-removed temp files.
    }
  }
}
