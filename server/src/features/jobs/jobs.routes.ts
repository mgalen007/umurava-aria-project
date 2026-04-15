import { Router } from 'express';
import { getJobs, createJob, getJobById } from './jobs.controller';

const router = Router();

// GET /api/v1/jobs
router.route('/')
  .get(getJobs)
  .post(createJob);

// GET /api/v1/jobs/:id
router.route('/:id')
  .get(getJobById);

export default router;
