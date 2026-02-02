import express from 'express';
import * as windowController from '../controllers/registration-window.controller';
import { authenticate as protect, requireRole as restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(protect);

router.get('/', windowController.getAllRegistrationWindows);
router.get('/:id', windowController.getRegistrationWindow);

// Only GLOBAL_ADMIN can manage registration windows
router.post('/', restrictTo(UserRole.GLOBAL_ADMIN), windowController.createRegistrationWindow);
router.put('/:id', restrictTo(UserRole.GLOBAL_ADMIN), windowController.updateRegistrationWindow);
router.delete('/:id', restrictTo(UserRole.GLOBAL_ADMIN), windowController.deleteRegistrationWindow);

export default router;
