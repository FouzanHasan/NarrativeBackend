import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateSettingsSchema } from '../validators/settingsValidators';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

router.get('/', auth, settingsController.getSettings);
router.put('/', auth, validate(updateSettingsSchema), settingsController.updateSettings);

export default router;
