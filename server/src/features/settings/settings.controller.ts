import { NextFunction, Request, Response } from 'express';
import { SettingsService } from './settings.service';

export class SettingsController {
  private service = new SettingsService();

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.service.getSettings(req.user!.id);
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateProfile(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.changePassword(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  updateAiPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateAiPreferences(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  updateParsingPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateParsingPreferences(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  clearData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.clearData(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteAccount(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
