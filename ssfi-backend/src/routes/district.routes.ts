import express from 'express';
import * as districtController from '../controllers/district.controller';
import { authenticate as protect, requireRole as restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(districtController.getDistricts)
    .post(restrictTo('GLOBAL_ADMIN', 'STATE_SECRETARY'), districtController.createDistrict);

router
    .route('/:id')
    .put(restrictTo('GLOBAL_ADMIN', 'STATE_SECRETARY'), districtController.updateDistrict)
    .delete(restrictTo('GLOBAL_ADMIN'), districtController.deleteDistrict);

export default router;
