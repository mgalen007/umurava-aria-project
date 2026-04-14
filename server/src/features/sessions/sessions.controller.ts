import { Request, Response, NextFunction } from 'express';
import { SessionsService } from './sessions.service';

type IdParam = { id: string };

export class SessionsController {
  private service = new SessionsService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await this.service.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  run = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.run(req.params.id, req.user!.id);
      res.status(202).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessions = await this.service.findAll(req.user!.id);
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  };

  findOne = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const session = await this.service.findOne(req.params.id, req.user!.id);
      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  submitFeedback = async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const session = await this.service.submitFeedback(
        req.params.id,
        req.body,
        req.user!.id
      );
      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };
}