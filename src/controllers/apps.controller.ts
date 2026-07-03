import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as appsService from '../services/appsService';

export const getApps = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const apps = await appsService.getApps(req.user.id);
  res.status(200).json({ success: true, data: apps });
});

export const updateApps = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const apps = await appsService.updateApps(req.user.id, req.body.selectedApps);
  res.status(200).json({ success: true, data: apps });
});
