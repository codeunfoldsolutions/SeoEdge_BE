import nodemailer from "nodemailer";
import logger from "../config/logger";
import env from "../config/env";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  secure: false,
  auth: { user: env.MAIL_USER, pass: env.MAIL_PASS },
  port: 465,
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: env.DEFAULT_MAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.log(error);
    logger.error(`Error sending email: ${error}`);
    throw new Error("Failed to send email");
  }
};

export const generateOTP = (): string => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};
