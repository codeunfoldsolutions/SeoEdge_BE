import { Request } from "express";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationRequest extends Request {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface SessionRefreshRequest extends Request {
  body: {
    refreshToken: string;
  };
}

export interface VerifyEmailAuthRequest extends Request {
  body: {
    email: string;
    otp: string;
  };
}

export interface ResendOtpRequest extends Request {
  body: {
    email: string;
  };
}

export interface SendPasswordResetEmailRequest extends Request {
  body: {
    email: string;
  };
}

export interface PasswordResetRequest extends Request {
  body: {
    password: string;
    refreshToken: string;
  };
  accessToken?: string;
}
