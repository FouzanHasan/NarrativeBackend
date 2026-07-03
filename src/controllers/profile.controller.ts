import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as profileService from '../services/profileService';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await profileService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await profileService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: profile });
});
