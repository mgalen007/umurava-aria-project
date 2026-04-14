import { Request, Response, NextFunction } from 'express';
import { CandidatesService } from './candidates.service';

type IdParam = { id: string }

export class CandidatesController {
  private service = new CandidatesService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidate = await this.service.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidates = await this.service.findAll(req.user!.id);
      res.json({ success: true, data: candidates });
    } catch (err) {
      next(err);
    }
  };

  findOne = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const candidate = await this.service.findOne(req.params.id, req.user!.id);
      res.json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const candidate = await this.service.update(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Candidate deleted' });
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.json({ success: true, data: [] });
        return;
      }
      const candidates = await this.service.search(query, req.user!.id);
      res.json({ success: true, data: candidates });
    } catch (err) {
      next(err);
    }
  };

  ingestPDFs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No files uploaded' });
        return;
      }
      const result = await this.service.ingestPDFs(files, req.user!.id);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  ingestCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      const result = await this.service.ingestCSV(file, req.user!.id);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}