import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import settingsRoutes from './settings.routes';
import appsRoutes from './apps.routes';
import logsRoutes from './logs.routes';
import promptsRoutes from './prompts.routes';
import devRoutes from './dev.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/settings', settingsRoutes);
router.use('/apps', appsRoutes);
router.use('/logs', logsRoutes);
router.use('/prompts', promptsRoutes);
router.use('/dev', devRoutes);

export default router;
