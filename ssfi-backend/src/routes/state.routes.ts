import express from 'express';
import * as stateController from '../controllers/state.controller';
import { authenticate as protect, requireRole as restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(protect);

router.get('/', stateController.getStates);
router.post('/', restrictTo(UserRole.GLOBAL_ADMIN), stateController.createState);
router.put('/:id', restrictTo(UserRole.GLOBAL_ADMIN), stateController.updateState);
router.delete('/:id', restrictTo(UserRole.GLOBAL_ADMIN), stateController.deleteState);

export default router;
