import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';

/**
 * Verifies the Bearer JWT and attaches { id } to req.user. All downstream
 * resource access must scope queries to req.user.id — never trust a userId
 * from the request body — this is the entire authorization model for V1.
 */
export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
