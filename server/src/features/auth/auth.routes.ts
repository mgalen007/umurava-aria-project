import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import { AuthController } from './auth.controller';
import { loginDto, registerDto } from './auth.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerDto), controller.register);
router.post('/login', validate(loginDto), controller.login);
router.get('/me', auth, controller.me);

export default router;
