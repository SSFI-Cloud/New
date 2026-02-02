import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const getAllClubs = async (query: any) => {
    const { page = 1, limit = 10, search, stateId, districtId, status, sortField = 'clubName', sortOrder = 'asc' } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.ClubWhereInput = {
        isActive: true,
        ...(stateId && { stateId: Number(stateId) }),
        ...(districtId && { districtId: Number(districtId) }),
        ...(search && {
            OR: [
                { name: { contains: search as string } },
                { code: { contains: search as string } },
            ],
        }),
    };

    // Filter by status if provided (e.g. PENDING, APPROVED)
    if (status) {
        where.status = status;
    }

    // Dynamic sorting
    const orderBy: any = {};
    if (sortField === 'state_name') {
        orderBy.state = { name: sortOrder };
    } else if (sortField === 'district_name') {
        orderBy.district = { name: sortOrder };
    } else if (sortField === 'club_name') {
        orderBy.name = sortOrder;
    } else if (sortField === 'clubowner_name') {
        orderBy.clubOwner = { name: sortOrder }; // Assuming clubOwner relation and name field exists/is reachable
    } else if (sortField === 'skatersCount') {
        orderBy.students = { _count: sortOrder };
    } else {
        // Check for valid fields in Club model
        if (['name', 'code', 'createdAt'].includes(sortField as string)) {
            orderBy[sortField] = sortOrder;
        } else {
            orderBy.name = sortOrder; // Fallback
        }
    }

    const [clubs, total] = await Promise.all([
        prisma.club.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                state: { select: { id: true, name: true, code: true } },
                district: { select: { id: true, name: true, code: true } },
                clubOwner: { select: { id: true, name: true } },
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
        }),
        prisma.club.count({ where }),
    ]);

    // Format data
    const formattedClubs = clubs.map((club) => ({
        id: club.id,
        membership_id: club.code || club.registrationNumber || 'N/A', // Prefer code, fallback to regNo
        club_name: club.name,
        contact_person: club.contactPerson || club.clubOwner?.name || 'N/A',
        mobile_number: club.phone || 'N/A',
        email_address: club.email || 'N/A',
        district_name: club.district.name,
        state_name: club.state?.name || 'N/A',
        state_code: club.state?.code || 'N/A',
        established_year: club.establishedYear ? String(club.establishedYear) : 'N/A',
        skatersCount: club._count.students,
        verified: club.status === 'APPROVED' ? 1 : 0,
        status: club.isActive ? 'active' : 'inactive',
        request_status: club.status, // Add request status
        created_at: club.createdAt,
        club_address: club.address,
        logo_path: club.logo,
        registration_number: club.registrationNumber
    }));

    return {
        clubs: formattedClubs,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};

export const createClub = async (data: any) => {
    // Basic creation logic - usually Clubs are created via Registration flow, but Admin might create them too
    // For now, simple create
    return prisma.club.create({
        data,
    });
};

export const updateClubStatus = async (id: number, status: string, remarks?: string) => {
    // Validate status if needed (APPROVED, REJECTED)
    const club = await prisma.club.update({
        where: { id },
        data: { status: status as any },
    });

    // Log remarks if needed

    return club;
};
