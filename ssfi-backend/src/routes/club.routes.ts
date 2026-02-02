import express from 'express';
import * as clubController from '../controllers/club.controller';
import { authenticate as protect, requireRole as restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(protect);

router.get('/', clubController.getClubs);
router.put('/:id/status', restrictTo(UserRole.GLOBAL_ADMIN), clubController.updateClubStatus);

export default router;
