import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { seedDemoData } from '../seed/seedData';

// Dev-only convenience endpoint. Gated at the route layer (routes/dev.routes.ts)
// so it 403s/404s outside development, per the ethics/privacy hard requirement
// that nothing resembling a data-collection or debug backdoor is reachable in
// a production deployment.
export const seed = asyncHandler(async (_req: Request, res: Response) => {
  const result = await seedDemoData();
  res.status(200).json({
    success: true,
    data: {
      message: 'Demo data seeded',
      credentials: { email: result.email, password: result.password },
      userId: result.userId,
    },
  });
});
