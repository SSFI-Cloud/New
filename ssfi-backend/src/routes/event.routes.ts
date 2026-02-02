import express from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate as protect, requireRole as restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(protect);

router.get('/', eventController.getEvents);
router.get('/my-events', eventController.getMyEvents);
router.get('/:id', eventController.getEvent);
router.put('/:id/status', restrictTo(UserRole.GLOBAL_ADMIN), eventController.updateEventStatus);

export default router;
