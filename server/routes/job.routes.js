import express from 'express';
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/job.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, authorize('HIRING_MANAGER'), createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('HIRING_MANAGER'), updateJob)
  .delete(protect, authorize('HIRING_MANAGER'), deleteJob);

export default router;
