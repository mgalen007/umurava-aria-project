import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { SettingsController } from './settings.controller';
import {
  changePasswordDto,
  updateAiPreferencesDto,
  updateParsingPreferencesDto,
  updateProfileDto,
} from './settings.dto';

const router = Router();
const controller = new SettingsController();

router.use(auth);

router.get('/', controller.getSettings);
router.patch('/profile', validate(updateProfileDto), controller.updateProfile);
router.post('/password', validate(changePasswordDto), controller.changePassword);
router.patch('/ai', validate(updateAiPreferencesDto), controller.updateAiPreferences);
router.patch('/parsing', validate(updateParsingPreferencesDto), controller.updateParsingPreferences);
router.delete('/data', controller.clearData);
router.delete('/account', controller.deleteAccount);

export default router;
