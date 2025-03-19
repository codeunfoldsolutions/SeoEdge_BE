import { Response } from "express";
import { StatusCodes } from "http-status-codes";

interface ResponseData {
  message: string;
  data?: any;
  errors?: any;
}

export const handleResponse = (
  res: Response,
  statusCode: StatusCodes,
  message: string,
  data?: any,
  errors?: any
): void => {
  const response: ResponseData = {
    message,
    ...(data && { data }),
    ...(errors && { errors }),
  };

  res.status(statusCode).json(response);
};
