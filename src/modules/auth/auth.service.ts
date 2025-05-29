import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../types/auth';
import { IUserDocument, UserModel } from '../../models/user.model';
import { generateOTP, sendEmail } from '../../utils/email';
import logger from '../../config/logger';

class AuthService {
  private static instance: AuthService;
  private userModel: Model<IUserDocument>;

  private constructor() {
    this.userModel = UserModel;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async checkIfUserExists(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      return { data: user ? [user] : [] };
    } catch (error) {
      logger.error(`Error checking user existence: ${error}`);
      throw new Error('Failed to check user existence');
    }
  }

  async createAuthUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate OTP
      const otp = generateOTP();

      // Create user
      const user = await this.userModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isEmailVerified: false,
        emailVerificationToken: otp,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        text: `Your verification code is: ${otp}`,
      });

      return { auth_id: user._id };
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      return { error: 'Failed to create user' };
    }
  }

  async verifyEmailAuth(email: string, otp: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        return { error: 'User not found' };
      }

      if (user.isEmailVerified) {
        return { error: 'Email already verified' };
      }

      if (
        user.emailVerificationToken !== otp ||
        !user.emailVerificationExpires ||
        user.emailVerificationExpires < new Date()
      ) {
        return { error: 'Invalid or expired OTP' };
      }

      // Update user verification status
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        session: { accessToken, refreshToken },
      };
    } catch (error) {
      logger.error(`Error verifying email: ${error}`);
      return { error: 'Failed to verify email' };
    }
  }

  async signInUser(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        return { error: 'Invalid credentials', status: 401 };
      }

      // const isPasswordValid = await bcrypt.compare(password, user.password);

      // if (!isPasswordValid) {
      //   // return { error: 'Invalid credentials', status: 401 };
      // }

      if (!user.isEmailVerified) {
        return { error: 'Please verify your email first', status: 403 };
      }

      const { accessToken, refreshToken } = this.generateTokens(user);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        session: { accessToken, refreshToken },
      };
    } catch (error) {
      logger.error(`Error signing in user: ${error}`);
      throw new Error('Failed to sign in user');
    }
  }

  async resendOtp(email: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        return { error: 'User not found' };
      }

      if (user.isEmailVerified) {
        return { error: 'Email already verified' };
      }

      const otp = generateOTP();
      user.emailVerificationToken = otp;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail({
        to: email,
        subject: 'Verify your email',
        text: `Your verification code is: ${otp}`,
      });

      return { data: { message: 'OTP sent successfully' } };
    } catch (error) {
      logger.error(`Error resending OTP: ${error}`);
      return { error: 'Failed to resend OTP' };
    }
  }

  async sendResetPasswordEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        return { error: 'User not found' };
      }

      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: email,
        subject: 'Reset your password',
        text: `Click the following link to reset your password: ${resetUrl}`,
      });

      return { data: { message: 'Reset password email sent successfully' } };
    } catch (error) {
      logger.error(`Error sending reset password email: ${error}`);
      return { error: 'Failed to send reset password email' };
    }
  }

  async updateUserPassword(
    password: string,
    accessToken: string,
    refreshToken: string
  ) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await this.userModel.findById(decoded.userId);

      if (!user) {
        return { error: 'User not found' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      return { data: { message: 'Password updated successfully' } };
    } catch (error) {
      logger.error(`Error updating password: ${error}`);
      return { error: 'Failed to update password' };
    }
  }

  private generateTokens(user: IUserDocument) {
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}

export default AuthService;
