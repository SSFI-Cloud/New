import { PrismaClient, UserRole } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

// ==========================================
// GLOBAL ADMIN DASHBOARD
// ==========================================

export const getGlobalAdminDashboard = async () => {
  try {
    const [
      totalStates,
      totalDistricts,
      totalClubs,
      totalStudents,
      totalEvents,
      pendingStateSecretaries,
      pendingDistrictSecretaries,
      pendingClubs,
      pendingUsers,
      recentStudents,
      recentClubs,
      recentEvents,
      genderStats,
      statusStats,
      registrationDates
    ] = await Promise.all([
      prisma.state.count(),
      prisma.district.count(),
      prisma.club.count({ where: { status: 'APPROVED' } }),
      prisma.student.count(),
      prisma.event.count(),
      prisma.stateSecretary.count({ where: { status: 'PENDING' } }),
      prisma.districtSecretary.count({ where: { status: 'PENDING' } }),
      prisma.club.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: UserRole.STUDENT, isApproved: false } }),
      prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          club: { select: { name: true } },
          user: { select: { approvalStatus: true } },
        },
      }),
      prisma.club.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          uid: true,
          name: true,
          status: true,
          createdAt: true,
          district: { select: { name: true } },
        },
      }),
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: { not: 'DRAFT' } },
        select: {
          id: true,
          code: true,
          name: true,
          eventDate: true,
          status: true,
          _count: { select: { registrations: true } },
        },
      }),
      // Statistics Queries
      prisma.student.groupBy({
        by: ['gender'],
        _count: { gender: true },
      }),
      prisma.user.groupBy({
        by: ['approvalStatus'],
        where: { role: UserRole.STUDENT },
        _count: { approvalStatus: true },
        // Map null/undefined statuses if necessary in processing
      }),
      prisma.student.findMany({
        select: { createdAt: true },
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) // Last 6 months
          }
        }
      })
    ]);

    // Process Statistics
    const studentsByGender = genderStats.reduce((acc, curr) => {
      acc[curr.gender] = curr._count.gender;
      return acc;
    }, {} as Record<string, number>);

    const studentsByStatus = statusStats.reduce((acc, curr) => {
      // Map Prisma enum to Frontend expected keys if needed, 
      // assuming frontend expects 'APPROVED', 'PENDING', 'REJECTED' which matches enum
      acc[curr.approvalStatus] = curr._count.approvalStatus;
      return acc;
    }, {} as Record<string, number>);

    // Process Monthly Registrations
    const registrationsByMonthMap = new Map<string, number>();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      registrationsByMonthMap.set(key, 0);
      months.push(key);
    }

    registrationDates.forEach(student => {
      const date = new Date(student.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (registrationsByMonthMap.has(key)) {
        registrationsByMonthMap.set(key, registrationsByMonthMap.get(key)! + 1);
      }
    });

    const registrationsByMonth = Array.from(registrationsByMonthMap.entries()).map(([month, count]) => ({
      month,
      count
    }));

    return {
      overview: {
        totalStates,
        totalDistricts,
        totalClubs,
        totalStudents,
        totalEvents,
      },
      pendingApprovals: {
        stateSecretaries: pendingStateSecretaries,
        districtSecretaries: pendingDistrictSecretaries,
        clubs: pendingClubs,
        students: pendingUsers,
        total: pendingStateSecretaries + pendingDistrictSecretaries + pendingClubs + pendingUsers,
      },
      recentActivity: {
        students: recentStudents,
        clubs: recentClubs,
        events: recentEvents,
      },
      statistics: {
        studentsByGender,
        studentsByStatus,
        registrationsByMonth
      }
    };
  } catch (error) {
    console.error('Error in getGlobalAdminDashboard:', error);
    throw error;
  }
};

// ==========================================
// STATE SECRETARY DASHBOARD
// ==========================================

export const getStateSecretaryDashboard = async (stateId: number) => {
  const [
    totalDistricts,
    totalClubs,
    totalStudents,
    totalEvents,
    pendingDistrictSecretaries,
    pendingClubs,
    recentStudents,
    recentClubs,
  ] = await Promise.all([
    prisma.district.count({ where: { stateId } }),
    prisma.club.count({ where: { stateId, status: 'APPROVED' } }),
    prisma.student.count({ where: { stateId } }),
    prisma.event.count({ where: { stateId } }),
    prisma.districtSecretary.count({ where: { stateId, status: 'PENDING' } }),
    prisma.club.count({ where: { stateId, status: 'PENDING' } }),
    prisma.student.findMany({
      where: { stateId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        club: { select: { name: true } },
        district: { select: { name: true } },
      },
    }),
    prisma.club.findMany({
      where: { stateId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        uid: true,
        name: true,
        status: true,
        createdAt: true,
        district: { select: { name: true } },
      },
    }),
  ]);

  return {
    overview: {
      totalDistricts,
      totalClubs,
      totalStudents,
      totalEvents,
    },
    pendingApprovals: {
      districtSecretaries: pendingDistrictSecretaries,
      clubs: pendingClubs,
      total: pendingDistrictSecretaries + pendingClubs,
    },
    recentActivity: {
      students: recentStudents,
      clubs: recentClubs,
    },
  };
};

// ==========================================
// DISTRICT SECRETARY DASHBOARD
// ==========================================

export const getDistrictSecretaryDashboard = async (districtId: number) => {
  const [
    totalClubs,
    totalStudents,
    pendingClubs,
    recentStudents,
    recentClubs,
  ] = await Promise.all([
    prisma.club.count({ where: { districtId, status: 'APPROVED' } }),
    prisma.student.count({ where: { districtId } }),
    prisma.club.count({ where: { districtId, status: 'PENDING' } }),
    prisma.student.findMany({
      where: { districtId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        club: { select: { name: true } },
      },
    }),
    prisma.club.findMany({
      where: { districtId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        uid: true,
        name: true,
        status: true,
        createdAt: true,
        _count: { select: { students: true } },
      },
    }),
  ]);

  return {
    overview: {
      totalClubs,
      totalStudents,
    },
    pendingApprovals: {
      clubs: pendingClubs,
      total: pendingClubs,
    },
    recentActivity: {
      students: recentStudents,
      clubs: recentClubs,
    },
  };
};

// ==========================================
// CLUB OWNER DASHBOARD
// ==========================================

export const getClubOwnerDashboard = async (clubId: number) => {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      state: { select: { name: true } },
      district: { select: { name: true } },
    },
  });

  if (!club) {
    throw new AppError('Club not found', 404);
  }

  const [
    totalStudents,
    recentStudents,
    recentRegistrations,
    upcomingEvents,
  ] = await Promise.all([
    prisma.student.count({ where: { clubId } }),
    prisma.student.findMany({
      where: { clubId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        gender: true,
        createdAt: true,
        profilePhoto: true,
      },
    }),
    prisma.eventRegistration.findMany({
      where: { clubId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        event: { select: { name: true, eventDate: true } },
        student: { select: { name: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        eventDate: { gte: new Date() },
        status: 'PUBLISHED',
      },
      take: 5,
      orderBy: { eventDate: 'asc' },
      select: {
        id: true,
        name: true,
        eventDate: true,
        registrationEndDate: true,
        status: true,
        venue: true,
        city: true,
      },
    }),
  ]);

  return {
    club: {
      id: club.id,
      uid: club.uid,
      name: club.name,
      code: club.code,
      state: club.state?.name,
      district: club.district?.name,
      status: club.status,
    },
    overview: {
      totalStudents,
    },
    recentActivity: {
      students: recentStudents,
      eventRegistrations: recentRegistrations,
    },
    upcomingEvents,
  };
};

// ==========================================
// STUDENT DASHBOARD
// ==========================================

export const getStudentDashboard = async (studentId: number) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { email: true, phone: true, expiryDate: true, isApproved: true } },
      club: { select: { id: true, name: true, phone: true } },
      state: { select: { name: true } },
      district: { select: { name: true } },
    },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const [
    eventRegistrations,
    upcomingEvents,
  ] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            code: true,
            eventDate: true,
            venue: true,
            city: true,
            status: true,
          },
        },
      },
    }),
    prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        registrationEndDate: { gte: new Date() },
      },
      take: 5,
      orderBy: { eventDate: 'asc' },
      select: {
        id: true,
        name: true,
        eventDate: true,
        registrationEndDate: true,
        venue: true,
        city: true,
        entryFee: true,
      },
    }),
  ]);

  const expiryDate = student.user?.expiryDate;
  const isActive = expiryDate ? new Date(expiryDate) >= new Date() : false;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    profile: {
      id: student.id,
      name: student.name,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      phone: student.user?.phone,
      email: student.user?.email,
      profilePhoto: student.profilePhoto,
      club: student.club,
      state: student.state?.name,
      district: student.district?.name,
    },
    membership: {
      isApproved: student.user?.isApproved,
      isActive,
      expiryDate,
      daysUntilExpiry: isActive ? daysUntilExpiry : 0,
      needsRenewal: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    },
    eventRegistrations: eventRegistrations.map(reg => ({
      id: reg.id,
      event: reg.event,
      status: reg.status,
      paymentStatus: reg.paymentStatus,
      categories: reg.categories,
      registeredAt: reg.createdAt,
    })),
    upcomingEvents,
    stats: {
      totalEventsRegistered: eventRegistrations.length,
      upcomingEventsCount: eventRegistrations.filter(
        r => new Date(r.event.eventDate) >= new Date()
      ).length,
      completedEventsCount: eventRegistrations.filter(
        r => new Date(r.event.eventDate) < new Date()
      ).length,
    },
  };
};

export default {
  getGlobalAdminDashboard,
  getStateSecretaryDashboard,
  getDistrictSecretaryDashboard,
  getClubOwnerDashboard,
  getStudentDashboard,
};
