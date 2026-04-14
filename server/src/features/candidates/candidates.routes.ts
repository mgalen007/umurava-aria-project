import { Router } from 'express';
import { CandidatesController } from './candidates.controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { createCandidateDto, updateCandidateDto } from './candidates.dto';

const router = Router();
const controller = new CandidatesController();

router.use(auth);

router.post('/', validate(createCandidateDto), controller.create);
router.get('/', controller.findAll);
router.get('/search', controller.search);
router.get('/:id', controller.findOne);
router.patch('/:id', validate(updateCandidateDto), controller.update);
router.delete('/:id', controller.remove);

// Chore: Add file ingestion later
// router.post('/ingest/pdf', upload.array('resumes', 50), controller.ingestPDFs);
// router.post('/ingest/csv', upload.single('file'), controller.ingestCSV);

export default router;