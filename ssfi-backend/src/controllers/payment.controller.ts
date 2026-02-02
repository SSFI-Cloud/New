import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { amount, description, metadata } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const order = await paymentService.createOrder(amount, 'INR', description, userId, metadata);

        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await paymentService.verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            registrationId
        );

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await paymentService.listPayments(userId, req.query);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
