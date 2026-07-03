import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as logService from '../services/logService';

export const createLog = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const log = await logService.createLog(req.user.id, req.body);
  res.status(201).json({ success: true, data: log });
});

export const listLogs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { limit, app } = req.query as { limit?: string; app?: string };
  const logs = await logService.listLogs(req.user.id, { limit, app });
  res.status(200).json({ success: true, data: logs });
});
