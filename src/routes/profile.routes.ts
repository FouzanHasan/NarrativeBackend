import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/profileValidators';
import * as profileController from '../controllers/profile.controller';

const router = Router();

router.get('/', auth, profileController.getProfile);
router.put('/', auth, validate(updateProfileSchema), profileController.updateProfile);

export default router;
