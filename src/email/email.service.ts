import nodemailer from "nodemailer";
import { type MailMessage } from "../types/email";
import logger from "../config/logger";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      port: Number(process.env.MAIL_PORT),
    });
  }

  // Static method to get the singleton instance
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendMail(message: MailMessage, responseMsg?: string) {
    try {
      await this.transporter.sendMail(message);
      logger.info(`Email sent`);
    } catch (error) {
      console.log(error);
      throw new Error("Error sending email");
    }
  }
}

export default EmailService;
