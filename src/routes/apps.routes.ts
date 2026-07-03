import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateAppsSchema } from '../validators/appsValidators';
import * as appsController from '../controllers/apps.controller';

const router = Router();

router.get('/', auth, appsController.getApps);
router.put('/', auth, validate(updateAppsSchema), appsController.updateApps);

export default router;
