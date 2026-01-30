import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const parsedBody = schema.safeParse(body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parsedBody.error.flatten(),
      });
    }
    req.body = parsedBody.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "Query Validation Error",
        errors: result.error.flatten(),
      });
    }
    req.query = result.data as any;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: "Params Validation Error",
        errors: result.error.flatten(),
      });
    }
    req.params = result.data as any;
    next();
  };
}
