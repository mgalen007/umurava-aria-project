import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';

type NotificationParams = {
  id?: string;
};

export class NotificationController {
  private service = new NotificationService();

  getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getUserNotifications(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: Request<NotificationParams>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await this.service.markAsRead(req.user!.id, id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
