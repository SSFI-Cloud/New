import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const getAllDistricts = async (query: any) => {
    const { page = 1, limit = 10, search, stateId, sortField = 'name', sortOrder = 'asc' } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.DistrictWhereInput = {
        isActive: true,
        ...(stateId && { stateId: Number(stateId) }),
        ...(search && {
            OR: [
                { name: { contains: search as string } }, // specific for mysql, case-insensitive is default usually but explicit mode might be needed depending on collation
                { code: { contains: search as string } },
            ],
        }),
    };

    // Dynamic sorting
    const orderBy: any = {};
    if (sortField === 'state_name') {
        orderBy.state = { name: sortOrder };
    } else if (sortField === 'district_name') { // Map frontend field to DB field
        orderBy.name = sortOrder;
    } else if (['clubsCount', 'skatersCount', 'eventsCount'].includes(sortField as string)) {
        // Sorting by relation count is not directly supported in simple orderBy in older Prisma versions easily without aggregation
        // For now fallback to name sorting or handle in memory if dataset is small, but for pagination DB sort is preferred.
        // We will sort by name as fallback for computed fields for now.
        orderBy.name = sortOrder;
    } else {
        // Check if the field actually exists in District model to avoid Prisma errors
        // Simple safety check, assuming 'name', 'code' etc are valid. 'createdAt' is likely valid.
        orderBy[sortField] = sortOrder;
    }

    const [districts, total] = await Promise.all([
        prisma.district.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                state: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: {
                        clubs: true,
                        students: true,
                        events: true,
                    },
                },
            },
        }),
        prisma.district.count({ where }),
    ]);

    // Format data for frontend
    const formattedDistricts = districts.map((district) => ({
        id: district.id,
        district_name: district.name,
        code: district.code,
        state_id: district.state.id,
        state_name: district.state.name,
        state_code: district.state.code,
        clubsCount: district._count.clubs,
        skatersCount: district._count.students,
        eventsCount: district._count.events,
        created_at: district.createdAt,
    }));

    return {
        districts: formattedDistricts,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};

export const createDistrict = async (data: { name: string; code: string; stateId: number }) => {
    const existingdev = await prisma.district.findUnique({
        where: {
            stateId_code: {
                stateId: data.stateId,
                code: data.code,
            },
        },
    });

    if (existingdev) {
        throw new AppError('District with this code already exists in the state', 400);
    }

    return prisma.district.create({
        data: {
            name: data.name,
            code: data.code,
            stateId: data.stateId,
        },
        include: {
            state: true,
        },
    });
};

export const updateDistrict = async (id: number, data: { name?: string; code?: string; stateId?: number }) => {
    const district = await prisma.district.findUnique({ where: { id } });
    if (!district) throw new AppError('District not found', 404);

    return prisma.district.update({
        where: { id },
        data,
        include: { state: true },
    });
};

export const deleteDistrict = async (id: number) => {
    const district = await prisma.district.findUnique({ where: { id } });
    if (!district) throw new AppError('District not found', 404);

    // Soft delete ideally, but schema has isActive
    return prisma.district.update({
        where: { id },
        data: { isActive: false },
    });
};
