import { CorsOptions } from "cors";
import connectDB from "./db";
import env from "./env";

// Base allowed origins
const allowedOrigins = ["http://localhost:3000", "https://seoedge.netlify.app"];

class Config {
  PORT: number;
  CORS: CorsOptions;

  constructor() {
    const { PORT } = env;
    this.PORT = PORT;

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
    const { MONGODB_URI } = env;
    await connectDB(MONGODB_URI);
  }
}

const config = new Config();
export default config;
