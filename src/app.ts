import express from "express";
import router from "./routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import morganConfig from "./config/morgan";
import { errorHandler } from "./middlewares/error-handler";

const app = express();
app.use(cors(config.CORS));
app.use(express.json());
app.use(morganConfig);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/v1/api", router);
app.use(errorHandler);

export default app;
