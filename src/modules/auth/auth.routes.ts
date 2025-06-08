import { Router } from "express";
import { validateData, verifyJWT } from "../../middlewares";
import {
  registrationSchema,
  loginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  sendPasswordResetEmailSchema,
  sessionRefreshSchema,
  passwordResetSchema,
} from "./auth.validations";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";

const AuthRouter = Router();
const authController = new AuthController(AuthService.getInstance());

// Register new user
AuthRouter.post(
  "/register",
  validateData(registrationSchema),
  authController.handleRegistration.bind(authController)
);

// Login user
AuthRouter.post(
  "/login",
  validateData(loginSchema),
  authController.handleLogin.bind(authController)
);

// Refresh acess token
AuthRouter.post(
  "/login/refresh",
  validateData(sessionRefreshSchema),
  authController.handleSessionRefresh.bind(authController)
);

// Verify email with OTP
AuthRouter.post(
  "/verify-email",
  validateData(verifyEmailSchema),
  authController.handleVerifyEmailAuth.bind(authController)
);

// Resend verification OTP
AuthRouter.post(
  "/resend-otp",
  validateData(resendOtpSchema),
  authController.handleResendOtp.bind(authController)
);

// Send password reset email
AuthRouter.post(
  "/password-recovery",
  validateData(sendPasswordResetEmailSchema),
  authController.handleSendPasswordResetEmail.bind(authController)
);

// Reset password
AuthRouter.patch(
  "/reset-password",
  verifyJWT,
  validateData(passwordResetSchema),
  authController.handlePasswordReset.bind(authController)
);

export default AuthRouter;
