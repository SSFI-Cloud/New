import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const getAllStates = async (query: any) => {
    const { page = 1, limit = 10, search, sortField = 'name', sortOrder = 'asc' } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.StateWhereInput = {
        isActive: true,
        ...(search && {
            OR: [
                { name: { contains: search as string } },
                { code: { contains: search as string } },
            ],
        }),
    };

    // Dynamic sorting
    const orderBy: any = {};
    if (['districtsCount', 'clubsCount', 'studentsCount'].includes(sortField as string)) {
        orderBy.name = sortOrder;
    } else if (sortField === 'state_name') {
        orderBy.name = sortOrder;
    } else {
        orderBy[sortField] = sortOrder;
    }

    const [states, total] = await Promise.all([
        prisma.state.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                _count: {
                    select: {
                        districts: true,
                        clubs: true,
                        students: true,
                        events: true,
                    },
                },
            },
        }),
        prisma.state.count({ where }),
    ]);

    // Format data
    const formattedStates = states.map((state) => ({
        id: state.id,
        state_name: state.name,
        code: state.code,
        logo: state.logo,
        website: state.website,
        districtsCount: state._count.districts,
        clubsCount: state._count.clubs,
        skatersCount: state._count.students,
        eventsCount: state._count.events,
        created_at: state.createdAt,
    }));

    return {
        states: formattedStates,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};

export const createState = async (data: { name: string; code: string; logo?: string; website?: string }) => {
    const existing = await prisma.state.findFirst({
        where: {
            OR: [
                { name: data.name },
                { code: data.code }
            ]
        }
    });

    if (existing) {
        throw new AppError('State with this name or code already exists', 400);
    }

    return prisma.state.create({
        data: {
            name: data.name,
            code: data.code,
            logo: data.logo,
            website: data.website
        },
    });
};

export const updateState = async (id: number, data: { name?: string; code?: string; logo?: string; website?: string }) => {
    const state = await prisma.state.findUnique({ where: { id } });
    if (!state) throw new AppError('State not found', 404);

    return prisma.state.update({
        where: { id },
        data,
    });
};

export const deleteState = async (id: number) => {
    const state = await prisma.state.findUnique({ where: { id } });
    if (!state) throw new AppError('State not found', 404);

    return prisma.state.update({
        where: { id },
        data: { isActive: false },
    });
};
