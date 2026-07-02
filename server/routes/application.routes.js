import express from 'express';
import { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus } from '../controllers/application.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/:jobId', protect, authorize('STUDENT'), applyForJob);
router.get('/my', protect, authorize('STUDENT'), getMyApplications);
router.get('/job/:jobId', protect, authorize('HIRING_MANAGER'), getJobApplications);
router.put('/:id', protect, authorize('HIRING_MANAGER'), updateApplicationStatus);

export default router;
