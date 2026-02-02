import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async () => {
    // 1. Basic Counts
    const [
        totalStudents,
        totalClubs,
        totalEvents,
        totalRevenueResult
    ] = await Promise.all([
        prisma.student.count(),
        prisma.club.count(),
        prisma.event.count(),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED' }
        })
    ]);

    // 2. Pending Approvals
    const [
        pendingStateSecretaries,
        pendingDistrictSecretaries,
        pendingClubs
    ] = await Promise.all([
        prisma.stateSecretary.count({ where: { status: 'PENDING' } }),
        prisma.districtSecretary.count({ where: { status: 'PENDING' } }),
        prisma.club.count({ where: { status: 'PENDING' } })
    ]);

    // 3. State-wise Student Distribution (Top 5)
    // Prisma doesn't support complex GROUP BY with relation names easily in one go without raw query or post-processing.
    // For simplicity/safety, we'll group by stateId and then fetch state names, or just use raw query if confident.
    // Let's use groupBy.
    const studentsByState = await prisma.student.groupBy({
        by: ['stateId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
    });

    // Fetch state names efficiently
    const stateIds = studentsByState.map(s => s.stateId);
    const states = await prisma.state.findMany({
        where: { id: { in: stateIds } },
        select: { id: true, name: true }
    });

    const topStates = studentsByState.map(item => {
        const state = states.find(s => s.id === item.stateId);
        return {
            name: state?.name || 'Unknown',
            count: item._count.id
        };
    });

    // 4. Recent Transactions
    const recentTransactions = await prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
    });

    return {
        overview: {
            totalStudents,
            totalClubs,
            totalEvents,
            totalRevenue: totalRevenueResult._sum.amount || 0,
            pendingApprovals: {
                state: pendingStateSecretaries,
                district: pendingDistrictSecretaries,
                club: pendingClubs,
                total: pendingStateSecretaries + pendingDistrictSecretaries + pendingClubs
            }
        },
        analytics: {
            topStates
        },
        recentActivity: recentTransactions.map(t => ({
            id: t.id,
            amount: t.amount,
            type: t.paymentType,
            user: t.user?.email || 'Unknown',
            date: t.createdAt
        }))
    };
};
