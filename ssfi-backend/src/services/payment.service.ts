import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import logger from '../utils/logger.util';

const prisma = new PrismaClient();

// Initial Mock Implementation since keys are missing
export const createOrder = async (amount: number, currency = 'INR', description?: string, userId?: number, metadata: any = {}) => {
    // In real implementation:
    // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create({ amount: amount * 100, currency, receipt: ..., notes: ... });

    // Mock Order
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return {
        id: mockOrderId,
        entity: 'order',
        amount: amount * 100,
        amount_paid: 0,
        amount_due: amount * 100,
        currency,
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: { description, ...metadata },
        created_at: Math.floor(Date.now() / 1000)
    };
};

export const verifyPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    userId: number,
    registrationId?: number
) => {
    // In real implementation: Verify signature with crypto.createHmac
    // For mock: Always accept if using mock IDs

    let status = 'COMPLETED';
    if (!razorpayOrderId.startsWith('order_mock_')) {
        // If meant to be real, logic here. For now, assume success for dev.
        // checkSignature(...)
    }

    // Save Payment Record
    const payment = await prisma.payment.create({
        data: {
            userId,
            // amount: 0, REMOVED duplicate
            // Wait, we need the amount. For mock, we assume it matches what was requested.
            // In a real flow, we'd verify order details.
            // Let's assume passed amount or fetch from pending registration if linked?
            // Simplified: Save with dummy amount or update later.
            // Better: 'amount' is required in schema. 
            // We'll update schema or logic. For now, let's put a placeholder 0 or pass it.
            // Actually, verifyPayment usually doesn't take amount. 
            // We should find the Pending Payment record created during Order Creation?
            // The schema `Payment` table is created AFTER verification usually? 
            // OR created as PENDING when order is made?
            // Standard flow: 
            // 1. Create Order -> Store as Pending Payment in DB (optional but good) or just return ID.
            // 2. Client Pay
            // 3. Verify -> Create/Update Payment record as COMPLETED.

            // Let's create a COMPLETED payment record here directly for simplicity.
            amount: 1000, // Placeholder
            paymentType: 'REGISTRATION', // Or dynamic
            status: 'COMPLETED' as any,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            eventRegistrationId: registrationId,
            description: 'Payment Verification'
        }
    });

    if (registrationId) {
        // Update Registration Status
        await prisma.eventRegistration.update({
            where: { id: registrationId },
            data: {
                paymentStatus: 'COMPLETED',
                // status: 'APPROVED' // Maybe keep as PENDING approval even if paid? Or auto-approve?
                // Usually auto-approve if payment is the only gate.
            }
        });
    }

    return payment;
};

export const listPayments = async (userId: number, query: any) => {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.PaymentWhereInput = {
        userId,
        ...(status && { status: status as any }),
        ...(search && {
            OR: [
                { razorpayPaymentId: { contains: search as string } },
                { razorpayOrderId: { contains: search as string } },
                { description: { contains: search as string } }
            ]
        })
    };

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                eventRegistration: {
                    include: {
                        event: { select: { name: true, eventDate: true } }
                    }
                }
            }
        }),
        prisma.payment.count({ where })
    ]);

    return {
        payments,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        }
    };
};
