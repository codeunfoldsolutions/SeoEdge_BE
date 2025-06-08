import z from 'zod';
import { parseEnv } from 'znv';
import { config } from 'dotenv';

export enum NodeEnv {
  DEV = 'development',
  PROD = 'production',
}

config();

const env = parseEnv(process.env, {
  JWT_REFRESH_SECRET: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum([NodeEnv.DEV, NodeEnv.PROD]),
  MONGODB_URI: z.string(),
  PORT: z.number().positive(),
  MAIL_HOST: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  DEFAULT_MAIL_FROM: z.string().email(),
  FRONTEND_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_URL: z.string().url(),
  DISABLE_CHROME_SANDBOX: z.boolean().optional().default(true),
  PUPPETEER_SKIP_DOWNLOAD: z.boolean().optional().default(true),
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: z.boolean().optional().default(true),
});

export default env;
