import { Response } from "express";

type HandleResponseType = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => void;

const handleResponse: HandleResponseType = (
  res,
  statusCode,
  message,
  data = {}
) => {
  res.status(statusCode).json({ message, ...data });
};

export default handleResponse;
