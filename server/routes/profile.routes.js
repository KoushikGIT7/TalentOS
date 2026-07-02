import express from 'express';
import { getMyProfile, updateMyProfile, getProfileByUserId } from '../controllers/profile.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.get('/:userId', protect, authorize('HIRING_MANAGER'), getProfileByUserId);

export default router;
