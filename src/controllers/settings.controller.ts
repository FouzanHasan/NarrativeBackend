import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as settingsService from '../services/settingsService';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const settings = await settingsService.getSettings(req.user.id);
  res.status(200).json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const settings = await settingsService.updateSettings(req.user.id, req.body);
  res.status(200).json({ success: true, data: settings });
});
