import express from "express";
import router from "./routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import morganConfig from "./config/morgan";
import { errorHandler } from "./middlewares/error-handler";
import { handleResponse } from "./utils";
import { StatusCodes } from "http-status-codes";

const app = express();
app.use(cors(config.CORS));
app.use(express.json());
app.use(morganConfig);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/v1/api", router);
app.use(errorHandler);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    handleResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong!"
    );
  }
);

export default app;
