import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

import { protect } from '../middleware/auth.js';
import { getSavedJobs, saveJob, unsaveJob } from '../controllers/auth.controller.js';

router.get('/saved-jobs', protect, getSavedJobs);
router.post('/saved-jobs/:jobId', protect, saveJob);
router.delete('/saved-jobs/:jobId', protect, unsaveJob);

export default router;
