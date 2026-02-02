import express from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate as protect, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(requireRole('GLOBAL_ADMIN')); // Only Admins can view reports

router.get('/stats', reportController.getDashboardStats);

export default router;
