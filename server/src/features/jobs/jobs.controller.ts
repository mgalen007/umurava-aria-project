import { Request, Response, NextFunction } from 'express';
import { JobsService } from './jobs.service';

type IdParam = { id: string };

export class JobsController {
  private service = new JobsService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.service.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await this.service.findAll(req.user!.id);
      res.json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  };

  findOne = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const job = await this.service.findOne(req.params.id, req.user!.id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const job = await this.service.update(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Job deleted' });
    } catch (err) {
      next(err);
    }
  };
}
