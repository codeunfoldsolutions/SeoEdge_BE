import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodType } from "zod";
import { StatusCodes } from "http-status-codes";
import { handleResponse } from "../utils";

type ValidationSource = "body" | "query" | "params";

export default function validateData(
  schema: ZodType<any>, // Support all Zod schema types
  source: ValidationSource = "body", // Default to validating `req.body`
  customErrorMessage?: string // Optional custom error message
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[source]); // Validate based on the specified source
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((issue) => ({
          path: issue.path.join("."), // Include the path of the invalid field
          message: issue.message,
        }));

        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          customErrorMessage || "Invalid input data",
          { details: errorDetails }
        );
      } else {
        next(error); // Pass non-Zod errors to the error-handling middleware
      }
    }
  };
}
