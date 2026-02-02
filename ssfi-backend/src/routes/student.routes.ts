import express from 'express';
import * as studentController from '../controllers/student.controller';
import { authenticate as protect, requireRole as restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(protect);

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudent);
router.put('/:id/status', restrictTo(UserRole.GLOBAL_ADMIN, UserRole.STATE_SECRETARY, UserRole.DISTRICT_SECRETARY), studentController.updateStudentStatus);

export default router;
