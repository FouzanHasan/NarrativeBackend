import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as logService from '../services/logService';

// See services/logService.ts (listPromptHistory) for why this reuses
// UsageLog instead of a dedicated PromptEvent collection.
export const getPromptHistory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { limit } = req.query as { limit?: string };
  const history = await logService.listPromptHistory(req.user.id, { limit });
  res.status(200).json({ success: true, data: history });
});
