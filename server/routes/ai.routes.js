import express from 'express';
import { enhanceJobDescription, getMatchScore, generateCoverLetter } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/enhance-job', protect, authorize('HIRING_MANAGER'), enhanceJobDescription);
router.post('/match-score', protect, getMatchScore);
router.post('/generate-cover-letter', protect, generateCoverLetter);

export default router;
