import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate as protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/', paymentController.getAllPayments);

export default router;
