import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

type Target = 'body' | 'query';

/**
 * Generic zod validation middleware. Validates req[target] against the
 * given schema, replaces req[target] with the parsed (and coerced) value,
 * and forwards a 400 ApiError with field-level messages on failure.
 * Used on every mutating route per the security hygiene requirement.
 */
export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => `${e.path.join('.') || target}: ${e.message}`);
        next(ApiError.badRequest('Validation failed', errors));
        return;
      }
      next(err);
    }
  };
}
