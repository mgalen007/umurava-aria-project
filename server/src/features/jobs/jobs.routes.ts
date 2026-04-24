import { Router } from 'express';
import { JobsController } from './jobs.controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import { createJobDto, updateJobDto } from './jobs.dto';

const router = Router();
const controller = new JobsController();

router.use(auth);

router.post('/', validate(createJobDto), controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.patch('/:id', validate(updateJobDto), controller.update);
router.delete('/:id', controller.remove);

export default router;
