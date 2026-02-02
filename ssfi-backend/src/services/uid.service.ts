import { PrismaClient, UserRole } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

/**
 * UID Format: SSFI-[STATE_CODE]-[DIST_CODE]-[CLUB_CODE]-[SEQUENTIAL]
 * Examples:
 * - Global Admin: SSFI-00-00-00-0001
 * - State Secretary: SSFI-KA-00-00-0001
 * - District Secretary: SSFI-KA-MYS-00-0001
 * - Club Owner: SSFI-KA-MYS-RSC-0001
 * - Student: SSFI-KA-MYS-RSC-0001
 */

class UIDService {
  /**
   * Generate UID for Global Admin
   */
  async generateGlobalAdminUID(): Promise<string> {
    const count = await prisma.user.count({
      where: { role: UserRole.GLOBAL_ADMIN }
    });

    const sequential = String(count + 1).padStart(4, '0');
    return `SSFI-00-00-00-${sequential}`;
  }

  /**
   * Generate UID for State Secretary
   */
  async generateStateUID(stateCode: string): Promise<string> {
    const count = await prisma.user.count({
      where: {
        role: UserRole.STATE_SECRETARY,
        statePerson: {
          state: { code: stateCode }
        }
      }
    });

    const sequential = String(count + 1).padStart(4, '0');
    return `SSFI-${stateCode}-00-00-${sequential}`;
  }

  /**
   * Generate UID for District Secretary
   */
  async generateDistrictUID(stateCode: string, districtCode: string): Promise<string> {
    const count = await prisma.user.count({
      where: {
        role: UserRole.DISTRICT_SECRETARY,
        districtPerson: {
          district: {
            code: districtCode,
            state: { code: stateCode }
          }
        }
      }
    });

    const sequential = String(count + 1).padStart(4, '0');
    return `SSFI-${stateCode}-${districtCode}-00-${sequential}`;
  }

  /**
   * Generate UID for Club Owner
   */
  async generateClubUID(stateCode: string, districtCode: string, clubCode: string): Promise<string> {
    const count = await prisma.user.count({
      where: {
        role: UserRole.CLUB_OWNER,
        clubOwner: {
          club: {
            code: clubCode,
            district: {
              code: districtCode,
              state: { code: stateCode }
            }
          }
        }
      }
    });

    const sequential = String(count + 1).padStart(4, '0');
    return `SSFI-${stateCode}-${districtCode}-${clubCode}-${sequential}`;
  }

  /**
   * Generate UID for Student
   */
  async generateStudentUID(stateCode: string, districtCode: string, clubCode: string): Promise<string> {
    const count = await prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        student: {
          club: {
            code: clubCode,
            district: {
              code: districtCode,
              state: { code: stateCode }
            }
          }
        }
      }
    });

    const sequential = String(count + 1).padStart(4, '0');
    return `SSFI-${stateCode}-${districtCode}-${clubCode}-${sequential}`;
  }

  /**
   * Generate UID based on role and context
   */
  async generateUID(
    role: UserRole,
    context?: {
      stateCode?: string;
      districtCode?: string;
      clubCode?: string;
    }
  ): Promise<string> {
    switch (role) {
      case UserRole.GLOBAL_ADMIN:
        return this.generateGlobalAdminUID();

      case UserRole.STATE_SECRETARY:
        if (!context?.stateCode) {
          throw new AppError('State code is required for State Secretary UID', 400);
        }
        return this.generateStateUID(context.stateCode);

      case UserRole.DISTRICT_SECRETARY:
        if (!context?.stateCode || !context?.districtCode) {
          throw new AppError('State and District codes are required for District Secretary UID', 400);
        }
        return this.generateDistrictUID(context.stateCode, context.districtCode);

      case UserRole.CLUB_OWNER:
        if (!context?.stateCode || !context?.districtCode || !context?.clubCode) {
          throw new AppError('State, District, and Club codes are required for Club Owner UID', 400);
        }
        return this.generateClubUID(context.stateCode, context.districtCode, context.clubCode);

      case UserRole.STUDENT:
        if (!context?.stateCode || !context?.districtCode || !context?.clubCode) {
          throw new AppError('State, District, and Club codes are required for Student UID', 400);
        }
        return this.generateStudentUID(context.stateCode, context.districtCode, context.clubCode);

      default:
        throw new AppError('Invalid role for UID generation', 400);
    }
  }

  /**
   * Validate UID format
   */
  validateUID(uid: string): boolean {
    const pattern = /^SSFI-[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-\d{4}$/;
    return pattern.test(uid);
  }

  /**
   * Parse UID to extract components
   */
  parseUID(uid: string): {
    stateCode: string;
    districtCode: string;
    clubCode: string;
    sequential: string;
  } | null {
    if (!this.validateUID(uid)) {
      return null;
    }

    const parts = uid.split('-');
    return {
      stateCode: parts[1],
      districtCode: parts[2],
      clubCode: parts[3],
      sequential: parts[4]
    };
  }

  /**
   * Check if UID exists
   */
  async uidExists(uid: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { uid }
    });
    return count > 0;
  }

  /**
   * Get next available UID for a context
   */
  async getNextAvailableUID(
    role: UserRole,
    context?: {
      stateCode?: string;
      districtCode?: string;
      clubCode?: string;
    }
  ): Promise<string> {
    let uid: string;
    let exists = true;

    // Keep generating until we find a unique one
    while (exists) {
      uid = await this.generateUID(role, context);
      exists = await this.uidExists(uid);
    }

    return uid!;
  }
}

export default new UIDService();
