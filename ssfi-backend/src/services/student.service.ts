import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllStudents = async (query: any) => {
  const { page = 1, limit = 10, search, stateId, districtId, clubId, gender, status, sortField = 'name', sortOrder = 'asc' } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.StudentWhereInput = {
    // isActive: true, // Student model doesn't have isActive directly? User has it.
    user: {
      isActive: true,
      ...(status && { approvalStatus: status }), // Map status to user.approvalStatus
    },
    ...(stateId && { stateId: Number(stateId) }),
    ...(districtId && { districtId: Number(districtId) }),
    ...(clubId && { clubId: Number(clubId) }),
    ...(gender && { gender: gender }),
    ...(search && {
      OR: [
        { name: { contains: search as string } },
        { aadhaarNumber: { contains: search as string } },
        { user: { uid: { contains: search as string } } }, // Search by UID
      ],
    }),
  };

  // Dynamic sorting
  const orderBy: any = {};
  if (sortField === 'state_name') {
    orderBy.state = { name: sortOrder };
  } else if (sortField === 'district_name') {
    orderBy.district = { name: sortOrder };
  } else if (sortField === 'club_name') {
    orderBy.club = { name: sortOrder };
  } else if (sortField === 'uid') {
    orderBy.user = { uid: sortOrder };
  } else if (sortField === 'dob') {
    orderBy.dateOfBirth = sortOrder;
  } else {
    // Check for valid fields in Student model
    if (['name', 'gender', 'createdAt'].includes(sortField)) {
      orderBy[sortField] = sortOrder;
    } else {
      orderBy.name = sortOrder;
    }
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        state: { select: { id: true, name: true, code: true } },
        district: { select: { id: true, name: true, code: true } },
        club: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, uid: true, email: true, phone: true, approvalStatus: true, isActive: true } }, // Fetch user details
      },
    }),
    prisma.student.count({ where }),
  ]);

  // Format data
  const formattedStudents = (students as any).map((student: any) => ({
    id: student.id,
    ssfi_id: student.user.uid,
    name: student.name,
    dob: student.dateOfBirth,
    gender: student.gender,
    club_name: student.club.name,
    club_id: student.club.id,
    district_name: student.district.name,
    state_name: student.state.name,
    coach_name: student.coachName,
    status: student.user.approvalStatus, // ACTIVE/PENDING/etc based on approval
    approval_status: student.user.approvalStatus,
    profile_image: student.profilePhoto, // Check where photo is stored
    created_at: student.createdAt,
    // Additional fields expected by frontend can be added here
    father_name: student.fatherName,
    mobile: student.user.phone,
    email: student.user.email,
  }));

  return {
    students: formattedStudents,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getStudentById = async (id: number) => {
  return prisma.student.findUnique({
    where: { id },
    include: {
      state: true,
      district: true,
      club: true,
      user: true
    }
  });
}

export const updateStudentStatus = async (id: number, status: string, remarks?: string) => {
  // Determine user status based on student approval
  // If APPROVED, User -> ACTIVE. If REJECTED, User -> REJECTED (or similar)
  // Here we update the User model since approvalStatus is on User in this schema
  // First get the student to find the userId
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new Error('Student not found');

  const user = await prisma.user.update({
    where: { id: student.userId },
    data: { approvalStatus: status as any }
  });

  return user;
};
