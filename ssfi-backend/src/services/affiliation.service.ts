// @ts-nocheck
import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import {
  RegistrationWindow,
  UpdateRegistrationWindow,
  StateSecretaryRegistration,
  DistrictSecretaryRegistration,
  ClubRegistration,
  AffiliationQuery,
  RegistrationWindowQuery,
  RegistrationType,
} from '../validators/affiliation.validator';
import { AppError } from '../utils/errors';
import { encryptAadhaar } from '../utils/encryption.util';
import { generateUID } from './uid.service';
import logger from '../utils/logger.util';

const prisma = new PrismaClient();

// ==========================================
// REGISTRATION WINDOW MANAGEMENT
// ==========================================

/**
 * Create a new registration window
 */
export const createRegistrationWindow = async (
  data: RegistrationWindow,
  createdBy: string
) => {
  // Check if there's already an active window for this type
  const existingActive = await prisma.registrationWindow.findFirst({
    where: {
      type: data.type,
      isActive: true,
      endDate: { gte: new Date() },
    },
  });

  if (existingActive) {
    throw new AppError(
      `There's already an active registration window for ${data.type}. Please deactivate it first.`,
      400
    );
  }

  const window = await prisma.registrationWindow.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      fee: data.fee,
      isActive: data.isActive,
      createdBy,
    },
  });

  logger.info(`Registration window created: ${window.id}`, { type: data.type, createdBy });

  return window;
};

/**
 * Update a registration window
 */
export const updateRegistrationWindow = async (
  windowId: string,
  data: UpdateRegistrationWindow,
  updatedBy: string
) => {
  const existing = await prisma.registrationWindow.findUnique({
    where: { id: windowId },
  });

  if (!existing) {
    throw new AppError('Registration window not found', 404);
  }

  const updateData: any = { ...data, updatedBy, updatedAt: new Date() };

  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  const window = await prisma.registrationWindow.update({
    where: { id: windowId },
    data: updateData,
  });

  logger.info(`Registration window updated: ${windowId}`, { updatedBy });

  return window;
};

/**
 * Get registration windows
 */
export const getRegistrationWindows = async (query: RegistrationWindowQuery) => {
  const where: Prisma.RegistrationWindowWhereInput = {};

  if (query.type) where.type = query.type;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  if (!query.includeExpired) {
    where.endDate = { gte: new Date() };
  }

  return prisma.registrationWindow.findMany({
    where,
    orderBy: { startDate: 'desc' },
  });
};

/**
 * Get active registration window for a type
 */
export const getActiveRegistrationWindow = async (type: RegistrationType) => {
  const now = new Date();

  return prisma.registrationWindow.findFirst({
    where: {
      type,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
};

/**
 * Check if registration is open for a type
 */
export const isRegistrationOpen = async (type: RegistrationType): Promise<{
  isOpen: boolean;
  window: any | null;
  message: string;
}> => {
  const now = new Date();

  const window = await prisma.registrationWindow.findFirst({
    where: {
      type,
      isActive: true,
    },
    orderBy: { startDate: 'desc' },
  });

  if (!window) {
    return {
      isOpen: false,
      window: null,
      message: 'Registration is currently closed. Please check back later.',
    };
  }

  if (now < window.startDate) {
    return {
      isOpen: false,
      window,
      message: `Registration will open on ${window.startDate.toLocaleDateString('en-IN')}`,
    };
  }

  if (now > window.endDate) {
    return {
      isOpen: false,
      window,
      message: `Registration ended on ${window.endDate.toLocaleDateString('en-IN')}`,
    };
  }

  return {
    isOpen: true,
    window,
    message: `Registration is open until ${window.endDate.toLocaleDateString('en-IN')}`,
  };
};

/**
 * Delete/deactivate a registration window
 */
export const deleteRegistrationWindow = async (windowId: string, deletedBy: string) => {
  const window = await prisma.registrationWindow.update({
    where: { id: windowId },
    data: {
      isActive: false,
      deletedAt: new Date(),
      deletedBy,
    },
  });

  logger.info(`Registration window deactivated: ${windowId}`, { deletedBy });

  return window;
};

// ==========================================
// STATE SECRETARY REGISTRATION
// ==========================================

/**
 * Register a new state secretary
 */
export const registerStateSecretary = async (
  data: StateSecretaryRegistration,
  windowId: string
) => {
  // Check if registration is open
  const { isOpen, message } = await isRegistrationOpen('STATE_SECRETARY');
  if (!isOpen) {
    throw new AppError(message, 400);
  }

  // Check if state already has a secretary
  const existingSecretary = await prisma.stateSecretary.findFirst({
    where: {
      stateId: data.stateId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });

  if (existingSecretary) {
    throw new AppError('This state already has a secretary application pending or approved', 409);
  }

  // Check for duplicate Aadhaar
  const existingAadhaar = await prisma.stateSecretary.findFirst({
    where: { aadhaarNumber: data.aadhaarNumber },
  });

  if (existingAadhaar) {
    throw new AppError('An application with this Aadhaar number already exists', 409);
  }

  // Generate UID
  const state = await prisma.state.findUnique({ where: { id: data.stateId } });
  if (!state) throw new AppError('State not found', 404);

  const uid = await generateUID({
    stateCode: state.code,
    districtCode: '00',
    clubCode: '00',
    type: 'STATE',
  });

  // Encrypt Aadhaar
  const encryptedAadhaar = encryptAadhaar(data.aadhaarNumber);

  const secretary = await prisma.stateSecretary.create({
    data: {
      uid,
      name: data.name,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      aadhaarNumber: encryptedAadhaar,
      stateId: data.stateId,
      residentialAddress: data.residentialAddress,
      identityProof: data.identityProof,
      profilePhoto: data.profilePhoto,
      registrationWindowId: windowId,
      status: 'PENDING',
    },
    include: {
      state: { select: { id: true, name: true, code: true } },
    },
  });

  logger.info(`State Secretary registered: ${secretary.uid}`, { stateId: data.stateId });

  return secretary;
};

/**
 * List state secretaries
 */
export const listStateSecretaries = async (query: AffiliationQuery) => {
  const { page, limit, search, stateId, status, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.StateSecretaryWhereInput = {};

  if (stateId) where.stateId = stateId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { uid: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [secretaries, total] = await Promise.all([
    prisma.stateSecretary.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy === 'name' ? 'name' : 'createdAt']: sortOrder },
      include: {
        state: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.stateSecretary.count({ where }),
  ]);

  return {
    data: secretaries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ==========================================
// DISTRICT SECRETARY REGISTRATION
// ==========================================

/**
 * Register a new district secretary
 */
export const registerDistrictSecretary = async (
  data: DistrictSecretaryRegistration,
  windowId: string
) => {
  // Check if registration is open
  const { isOpen, message } = await isRegistrationOpen('DISTRICT_SECRETARY');
  if (!isOpen) {
    throw new AppError(message, 400);
  }

  // Check if district already has a secretary
  const existingSecretary = await prisma.districtSecretary.findFirst({
    where: {
      districtId: data.districtId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });

  if (existingSecretary) {
    throw new AppError('This district already has a secretary application pending or approved', 409);
  }

  // Check for duplicate Aadhaar
  const existingAadhaar = await prisma.districtSecretary.findFirst({
    where: { aadhaarNumber: data.aadhaarNumber },
  });

  if (existingAadhaar) {
    throw new AppError('An application with this Aadhaar number already exists', 409);
  }

  // Generate UID
  const district = await prisma.district.findUnique({
    where: { id: data.districtId },
    include: { state: true },
  });
  if (!district) throw new AppError('District not found', 404);

  const uid = await generateUID({
    stateCode: district.state.code,
    districtCode: district.code,
    clubCode: '00',
    type: 'DISTRICT',
  });

  // Encrypt Aadhaar
  const encryptedAadhaar = encryptAadhaar(data.aadhaarNumber);

  const secretary = await prisma.districtSecretary.create({
    data: {
      uid,
      name: data.name,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      aadhaarNumber: encryptedAadhaar,
      stateId: data.stateId,
      districtId: data.districtId,
      residentialAddress: data.residentialAddress,
      identityProof: data.identityProof,
      profilePhoto: data.profilePhoto,
      registrationWindowId: windowId,
      status: 'PENDING',
    },
    include: {
      state: { select: { id: true, name: true, code: true } },
      district: { select: { id: true, name: true, code: true } },
    },
  });

  logger.info(`District Secretary registered: ${secretary.uid}`, { districtId: data.districtId });

  return secretary;
};

/**
 * List district secretaries
 */
export const listDistrictSecretaries = async (query: AffiliationQuery) => {
  const { page, limit, search, stateId, districtId, status, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DistrictSecretaryWhereInput = {};

  if (stateId) where.stateId = stateId;
  if (districtId) where.districtId = districtId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { uid: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [secretaries, total] = await Promise.all([
    prisma.districtSecretary.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy === 'name' ? 'name' : 'createdAt']: sortOrder },
      include: {
        state: { select: { id: true, name: true, code: true } },
        district: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.districtSecretary.count({ where }),
  ]);

  return {
    data: secretaries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ==========================================
// CLUB REGISTRATION
// ==========================================

/**
 * Register a new club
 */
export const registerClub = async (
  data: ClubRegistration,
  windowId: string
) => {
  // Check if registration is open
  const { isOpen, message } = await isRegistrationOpen('CLUB');
  if (!isOpen) {
    throw new AppError(message, 400);
  }

  // Check for duplicate registration number
  const existingRegNumber = await prisma.club.findFirst({
    where: { registrationNumber: data.registrationNumber },
  });

  if (existingRegNumber) {
    throw new AppError('A club with this registration number already exists', 409);
  }

  // Check for duplicate name in same district
  const existingName = await prisma.club.findFirst({
    where: {
      name: data.clubName,
      districtId: data.districtId,
    },
  });

  if (existingName) {
    throw new AppError('A club with this name already exists in this district', 409);
  }

  // Get district and state info
  const district = await prisma.district.findUnique({
    where: { id: data.districtId },
    include: { state: true },
  });
  if (!district) throw new AppError('District not found', 404);

  // Generate club code
  const clubCode = await generateClubCode(data.districtId);

  // Generate UID
  const uid = await generateUID({
    stateCode: district.state.code,
    districtCode: district.code,
    clubCode,
    type: 'CLUB',
  });

  const club = await prisma.club.create({
    data: {
      uid,
      code: clubCode,
      name: data.clubName,
      registrationNumber: data.registrationNumber,
      establishedYear: data.establishedYear,
      contactPerson: data.contactPersonName,
      phone: data.phone,
      email: data.email || null,
      stateId: data.stateId,
      districtId: data.districtId,
      address: data.address,
      logo: data.clubLogo || null,
      registrationWindowId: windowId,
      status: 'PENDING',
    },
    include: {
      state: { select: { id: true, name: true, code: true } },
      district: { select: { id: true, name: true, code: true } },
    },
  });

  logger.info(`Club registered: ${club.uid}`, { districtId: data.districtId });

  return club;
};

/**
 * List clubs
 */
export const listClubs = async (query: AffiliationQuery) => {
  const { page, limit, search, stateId, districtId, status, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ClubWhereInput = {};

  if (stateId) where.stateId = stateId;
  if (districtId) where.districtId = districtId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { uid: { contains: search, mode: 'insensitive' } },
      { registrationNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [clubs, total] = await Promise.all([
    prisma.club.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy === 'clubName' ? 'name' : 'createdAt']: sortOrder },
      include: {
        state: { select: { id: true, name: true, code: true } },
        district: { select: { id: true, name: true, code: true } },
        _count: { select: { students: true } },
      },
    }),
    prisma.club.count({ where }),
  ]);

  return {
    data: clubs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ==========================================
// APPROVAL WORKFLOWS
// ==========================================

/**
 * Approve/Reject state secretary
 */
export const updateStateSecretaryStatus = async (
  secretaryId: string,
  status: 'APPROVED' | 'REJECTED',
  approvedBy: string,
  remarks?: string
) => {
  const secretary = await prisma.stateSecretary.findUnique({
    where: { id: secretaryId },
  });

  if (!secretary) {
    throw new AppError('State Secretary not found', 404);
  }

  const updated = await prisma.stateSecretary.update({
    where: { id: secretaryId },
    data: {
      status,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      approvedBy: status === 'APPROVED' ? approvedBy : null,
      rejectionRemarks: status === 'REJECTED' ? remarks : null,
      updatedAt: new Date(),
    },
    include: {
      state: true,
    },
  });

  // If approved, create user account
  if (status === 'APPROVED') {
    await createUserAccount({
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: 'STATE_SECRETARY',
      stateId: updated.stateId,
      referenceId: updated.id,
    });
  }

  logger.info(`State Secretary ${status}: ${secretary.uid}`, { approvedBy });

  return updated;
};

/**
 * Approve/Reject district secretary
 */
export const updateDistrictSecretaryStatus = async (
  secretaryId: string,
  status: 'APPROVED' | 'REJECTED',
  approvedBy: string,
  remarks?: string
) => {
  const secretary = await prisma.districtSecretary.findUnique({
    where: { id: secretaryId },
  });

  if (!secretary) {
    throw new AppError('District Secretary not found', 404);
  }

  const updated = await prisma.districtSecretary.update({
    where: { id: secretaryId },
    data: {
      status,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      approvedBy: status === 'APPROVED' ? approvedBy : null,
      rejectionRemarks: status === 'REJECTED' ? remarks : null,
      updatedAt: new Date(),
    },
    include: {
      state: true,
      district: true,
    },
  });

  // If approved, create user account
  if (status === 'APPROVED') {
    await createUserAccount({
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: 'DISTRICT_SECRETARY',
      stateId: updated.stateId,
      districtId: updated.districtId,
      referenceId: updated.id,
    });
  }

  logger.info(`District Secretary ${status}: ${secretary.uid}`, { approvedBy });

  return updated;
};

/**
 * Approve/Reject club
 */
export const updateClubStatus = async (
  clubId: string,
  status: 'APPROVED' | 'REJECTED',
  approvedBy: string,
  remarks?: string
) => {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!club) {
    throw new AppError('Club not found', 404);
  }

  const updated = await prisma.club.update({
    where: { id: clubId },
    data: {
      status,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      approvedBy: status === 'APPROVED' ? approvedBy : null,
      rejectionRemarks: status === 'REJECTED' ? remarks : null,
      updatedAt: new Date(),
    },
    include: {
      state: true,
      district: true,
    },
  });

  // If approved, create user account for club owner
  if (status === 'APPROVED') {
    await createUserAccount({
      name: updated.contactPerson,
      email: updated.email || '',
      phone: updated.phone,
      role: 'CLUB_OWNER',
      stateId: updated.stateId,
      districtId: updated.districtId,
      clubId: updated.id,
      referenceId: updated.id,
    });
  }

  logger.info(`Club ${status}: ${club.uid}`, { approvedBy });

  return updated;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate club code
 */
const generateClubCode = async (districtId: string): Promise<string> => {
  const lastClub = await prisma.club.findFirst({
    where: { districtId },
    orderBy: { code: 'desc' },
  });

  let sequence = 1;
  if (lastClub && lastClub.code) {
    const lastSequence = parseInt(lastClub.code.slice(-3)) || 0;
    sequence = lastSequence + 1;
  }

  return sequence.toString().padStart(3, '0');
};

/**
 * Create user account after approval
 */
const createUserAccount = async (data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  stateId?: string;
  districtId?: string;
  clubId?: string;
  referenceId: string;
}) => {
  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      role: data.role as any,
      stateId: data.stateId,
      districtId: data.districtId,
      clubId: data.clubId,
      password: tempPassword, // Should be hashed
      isActive: true,
      mustChangePassword: true,
    },
  });

  // TODO: Send SMS/Email with temporary password

  return user;
};

export default {
  // Registration Windows
  createRegistrationWindow,
  updateRegistrationWindow,
  getRegistrationWindows,
  getActiveRegistrationWindow,
  isRegistrationOpen,
  deleteRegistrationWindow,

  // State Secretary
  registerStateSecretary,
  listStateSecretaries,
  updateStateSecretaryStatus,

  // District Secretary
  registerDistrictSecretary,
  listDistrictSecretaries,
  updateDistrictSecretaryStatus,

  // Club
  registerClub,
  listClubs,
  updateClubStatus,
};
