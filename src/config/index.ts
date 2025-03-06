import dotenv from "dotenv";
import { CorsOptions } from "cors";
import connectDB from "./db";

// Base allowed origins
const allowedOrigins = ["http://localhost:3000"];

class Config {
  PORT: number;
  CORS: CorsOptions;

  constructor() {
    dotenv.config();
    this.PORT = this.getPort();
    this.CORS = {
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Check if the origin matches our exact allowed origins
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // If we reach here, the origin is not allowed
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      },
      credentials: true,
    };
  }

  async init() {
    const db_url = process.env.MONGODB_CLIENT as string;
    await connectDB(db_url);
  }

  getPort(): number {
    let port = parseInt(process.env.PORT as string);
    if (isNaN(port)) port = 3500;
    return port;
  }
}

const config = new Config();
export default config;
