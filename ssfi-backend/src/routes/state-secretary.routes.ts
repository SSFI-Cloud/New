import express from 'express';
import * as controller from '../controllers/state-secretary.controller';
import { authenticate as protect, requireRole as restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(protect);

// Only Admin should manage these approvals
router.get('/', restrictTo(UserRole.GLOBAL_ADMIN), controller.getStateSecretaries);
router.put('/:id/status', restrictTo(UserRole.GLOBAL_ADMIN), controller.updateStatus);

export default router;
