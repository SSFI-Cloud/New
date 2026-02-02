import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllEvents = async (query: any) => {
  const { page = 1, limit = 10, search, category, status, type, level, stateId, sortField = 'eventDate', sortOrder = 'desc' } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.EventWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search as string } },
        { code: { contains: search as string } },
        { location: { contains: search as string } }, // Assuming venue/location search
      ],
    }),
    ...(category && { category: category }), // Assuming exact enum match or string
    ...(status && { status: status }),
    ...(type && { eventType: type }),
    ...(level && { eventLevel: level }),
    ...(stateId && { stateId: Number(stateId) }),
  };

  // Dynamic sorting
  const orderBy: any = {};
  // Check for valid fields in Event model
  if (['name', 'eventDate', 'registrationStartDate', 'createdAt'].includes(sortField)) {
    orderBy[sortField] = sortOrder;
  } else {
    orderBy.eventDate = sortOrder;
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        state: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        _count: {
          select: { registrations: true }
        }
      },
    }),
    prisma.event.count({ where }),
  ]);

  // Format data
  const formattedEvents = events.map((event) => ({
    id: event.id,
    event_id: event.code,
    title: event.name,
    type: event.eventType,
    category: event.category, // e.g. NATIONAL
    level: event.eventLevel,
    start_date: event.eventDate,
    end_date: event.eventEndDate || event.eventDate,
    registration_deadline: event.registrationEndDate,
    venue: event.venue || 'TBD',
    city: event.city || 'TBD',
    state: event.state?.name || 'National',
    status: event.status, // DRAFT, PUBLISHED etc
    registrations_count: event._count.registrations,
    created_at: event.createdAt,
    // Add banner image if needed
    banner: event.bannerImage
  }));

  return {
    events: formattedEvents,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getEventById = async (id: number) => {
  return prisma.event.findUnique({
    where: { id },
    include: {
      state: true,
      district: true,
      creator: { select: { id: true, email: true } }
    }
  });
}

export const updateEventStatus = async (id: number, status: string, remarks?: string) => {
  return prisma.event.update({
    where: { id },
    data: { status: status as any }
  });
};

export const getUserEvents = async (userId: number, query: any) => {
  const { page = 1, limit = 10, search, status } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.EventRegistrationWhereInput = {
    // userId: userId, // REMOVED: userId is not on EventRegistration, we use studentId below
  };

  // Implementation note: We will need to first get the student ID for the user
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    // If user is not strictly a student (maybe a club owner registering?), return empty or handle logic.
    // For SSFI, registrations seem to be student-centric.
    return { events: [], meta: { total: 0, page, limit, totalPages: 0 } };
  }

  const registrationWhere: Prisma.EventRegistrationWhereInput = {
    studentId: student.id,
    ...(status && { status: status }),
    ...(search && {
      event: {
        name: { contains: search as string }
      }
    })
  };

  const [registrations, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: registrationWhere,
      skip,
      take,
      orderBy: { registrationDate: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            eventDate: true,
            eventEndDate: true,
            venue: true,
            city: true,
            category: true,
            status: true
          }
        },
        payment: {
          select: {
            status: true,
            amount: true
          }
        }
      }
    }),
    prisma.eventRegistration.count({ where: registrationWhere })
  ]);

  return {
    events: registrations.map(reg => ({
      id: reg.id,
      registration_status: reg.status,
      payment_status: reg.paymentStatus,
      details: reg.event,
      payment: reg.payment
    })),
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};
