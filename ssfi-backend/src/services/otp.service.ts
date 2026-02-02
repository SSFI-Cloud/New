import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

class OTPService {
  private twilioClient: any;

  constructor() {
    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  /**
   * Generate random OTP
   */
  generateOTP(length: number = parseInt(process.env.OTP_LENGTH || '6')): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }

    return otp;
  }

  /**
   * Calculate OTP expiry time
   */
  getOTPExpiry(): Date {
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
    return expiry;
  }

  /**
   * Send OTP via SMS using Twilio
   */
  async sendSMS(phone: string, message: string): Promise<void> {
    if (!this.twilioClient) {
      console.log(`SMS to ${phone}: ${message}`); // Log in development
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
    } catch (error) {
      console.error('Twilio SMS Error:', error);
      throw new AppError('Failed to send SMS', 500);
    }
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phone: string): Promise<string> {
    // Generate OTP
    const otp = this.generateOTP();
    const otpExpiry = this.getOTPExpiry();

    // Update user with OTP
    await prisma.user.update({
      where: { phone },
      data: {
        otp,
        otpExpiry
      }
    });

    // Send SMS
    const message = `Your SSFI verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes. Do not share this code with anyone.`;

    await this.sendSMS(phone, message);

    // Return OTP only in development mode
    if (process.env.NODE_ENV === 'development') {
      return otp;
    }

    return 'OTP sent successfully';
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        otp: true,
        otpExpiry: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
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

    return true;
  }

  /**
   * Clear OTP after successful verification
   */
  async clearOTP(phone: string): Promise<void> {
    await prisma.user.update({
      where: { phone },
      data: {
        otp: null,
        otpExpiry: null
      }
    });
  }

  /**
   * Send OTP for phone verification during registration
   */
  async sendRegistrationOTP(phone: string): Promise<void> {
    await this.sendOTP(phone);
  }

  /**
   * Send OTP for password reset
   */
  async sendPasswordResetOTP(phone: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return;
    }

    await this.sendOTP(phone);
  }

  /**
   * Check if OTP rate limit exceeded
   * Prevents spam by limiting OTP requests
   */
  async checkRateLimit(phone: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { otpExpiry: true }
    });

    if (!user) {
      return true;
    }

    // If there's an unexpired OTP, don't allow new request for 1 minute
    if (user.otpExpiry && new Date() < user.otpExpiry) {
      const timeDiff = user.otpExpiry.getTime() - new Date().getTime();
      const minutesRemaining = Math.ceil(timeDiff / 60000);

      if (minutesRemaining > (parseInt(process.env.OTP_EXPIRY_MINUTES || '10') - 1)) {
        throw new AppError('Please wait before requesting a new OTP', 429);
      }
    }

    return true;
  }
}

export default new OTPService();
