import { Router, Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import * as devController from '../controllers/dev.controller';

const router = Router();

// Hard-gated: this endpoint must not exist outside development. We 404
// (rather than 403) so its presence isn't even detectable in production.
function devOnly(_req: Request, res: Response, next: NextFunction): void {
  if (env.NODE_ENV === 'production') {
    res.status(404).json({ success: false, message: 'Not found' });
    return;
  }
  next();
}

router.post('/seed', devOnly, devController.seed);

export default router;
