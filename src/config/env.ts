import z from "zod";
import { parseEnv } from "znv";
import { config } from "dotenv";

export enum NodeEnv {
  DEV = "development",
  PROD = "production"
}

config();

const env = parseEnv(process.env, {
  JWT_REFRESH_SECRET: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.nativeEnum(NodeEnv),
  MONGODB_URI: z.string(),
  PORT: z.number().positive(),
  MAIL_HOST: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  DEFAULT_MAIL_FROM: z.string().email(),
  FRONTEND_URL: z.string().url(),
});

export default env;