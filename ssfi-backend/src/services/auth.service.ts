import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import otpService from './otp.service';
import uidService from './uid.service';

const prisma = new PrismaClient();

interface RegisterData {
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
  context?: {
    stateId?: number;
    districtId?: number;
    clubId?: number;
    stateCode?: string;
    districtCode?: string;
    clubCode?: string;
  };
}

interface LoginResponse {
  user: {
    id: number;
    uid: string;
    phone: string;
    email?: string;
    role: UserRole;
    isApproved: boolean;
    expiryDate?: Date | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  /**
   * Generate JWT Access Token
   */
  generateAccessToken(userId: number, uid: string, role: UserRole, phone: string, email?: string): string {
    return jwt.sign(
      { id: userId, uid, role, phone, email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRE || '24h' } as jwt.SignOptions
    );
  }

  /**
   * Generate JWT Refresh Token
   */
  generateRefreshToken(userId: number): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' } as jwt.SignOptions
    );
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Compare password
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Calculate expiry date (1 year from now)
   */
  calculateExpiryDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ userId: number; uid: string }> {
    const { phone, email, password, role, context } = data;

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      throw new AppError('Phone number already registered', 400);
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        throw new AppError('Email already registered', 400);
      }
    }

    // Generate UID
    const uid = await uidService.getNextAvailableUID(role, {
      stateCode: context?.stateCode,
      districtCode: context?.districtCode,
      clubCode: context?.clubCode
    });

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Calculate expiry date (Global Admin doesn't expire)
    const expiryDate = role === UserRole.GLOBAL_ADMIN ? null : this.calculateExpiryDate();

    // Create user
    const user = await prisma.user.create({
      data: {
        uid,
        phone,
        email,
        password: hashedPassword,
        role,
        expiryDate,
        isApproved: role === UserRole.GLOBAL_ADMIN, // Auto-approve Global Admin
        approvalStatus: role === UserRole.GLOBAL_ADMIN ? 'APPROVED' : 'PENDING'
      }
    });

    // Send OTP for phone verification
    await otpService.sendOTP(phone);

    return {
      userId: user.id,
      uid: user.uid
    };
  }

  /**
   * Login user
   */
  async login(phone: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        uid: true,
        phone: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        isApproved: true,
        otpVerified: true,
        expiryDate: true
      }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Check if phone is verified
    if (!user.otpVerified) {
      throw new AppError('Please verify your phone number first', 403);
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is approved (except Global Admin)
    if (!user.isApproved && user.role !== UserRole.GLOBAL_ADMIN) {
      throw new AppError('Your account is pending approval', 403);
    }

    // Check if account has expired
    if (user.expiryDate && new Date() > user.expiryDate) {
      throw new AppError('Your membership has expired. Please renew to continue.', 403);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(
      user.id,
      user.uid,
      user.role,
      user.phone,
      user.email || undefined
    );
    const refreshToken = this.generateRefreshToken(user.id);

    // Update refresh token and last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date()
      }
    });

    return {
      user: {
        id: user.id,
        uid: user.uid,
        phone: user.phone,
        email: user.email || undefined,
        role: user.role,
        isApproved: user.isApproved,
        expiryDate: user.expiryDate
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        otp: true,
        otpExpiry: true,
        otpVerified: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.otpVerified) {
      throw new AppError('Phone number already verified', 400);
    }

    if (!user.otp || !user.otpExpiry) {
      throw new AppError('No OTP found. Please request a new one.', 400);
    }

    if (new Date() > user.otpExpiry) {
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    return true;
  }

  /**
   * Resend OTP
   */
  async resendOTP(phone: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, otpVerified: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.otpVerified) {
      throw new AppError('Phone number already verified', 400);
    }

    await otpService.sendOTP(phone);
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as { id: number };

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          uid: true,
          phone: true,
          email: true,
          role: true,
          refreshToken: true,
          isActive: true
        }
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 403);
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(
        user.id,
        user.uid,
        user.role,
        user.phone,
        user.email || undefined
      );

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  }

  /**
   * Change password
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isValid = await this.comparePassword(oldPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(phone: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true }
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    await otpService.sendOTP(phone);
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(phone: string, otp: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        otp: true,
        otpExpiry: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.otp || !user.otpExpiry) {
      throw new AppError('No OTP found. Please request password reset again.', 400);
    }

    if (new Date() > user.otpExpiry) {
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });
  }
  /**
   * Update Profile
   */
  async updateProfile(userId: number, data: { phone?: string; email?: string }): Promise<any> {
    // Check if phone/email is already taken by another user
    if (data.phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: data.phone, id: { not: userId } }
      });
      if (existing) throw new AppError('Phone number already in use', 400);
    }

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } }
      });
      if (existing) throw new AppError('Email already in use', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phone,
        email: data.email
      },
      select: {
        id: true,
        uid: true,
        phone: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    return updatedUser;
  }
}

export default new AuthService();
