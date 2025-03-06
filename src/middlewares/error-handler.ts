import { ApiError } from "../lib/errors";
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ApiError) {
    res.status(error.code).json({ message: error.message });
  } else {
    logger.error(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};
