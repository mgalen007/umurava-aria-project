import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { auth } from '../../middleware/auth';

const router = Router();
const controller = new NotificationController();

router.use(auth);

router.get('/', controller.getUserNotifications);
router.put('/read', controller.markAsRead); // Mark all
router.put('/:id/read', controller.markAsRead); // Mark single

export default router;
