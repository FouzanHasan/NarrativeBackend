import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { promptsHistoryQuerySchema } from '../validators/logValidators';
import * as promptsController from '../controllers/prompts.controller';

const router = Router();

router.get('/history', auth, validate(promptsHistoryQuerySchema, 'query'), promptsController.getPromptHistory);

export default router;
