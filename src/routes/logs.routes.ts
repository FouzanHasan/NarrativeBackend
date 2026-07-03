import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLogSchema, listLogsQuerySchema } from '../validators/logValidators';
import * as logsController from '../controllers/logs.controller';

const router = Router();

router.post('/', auth, validate(createLogSchema), logsController.createLog);
router.get('/', auth, validate(listLogsQuerySchema, 'query'), logsController.listLogs);

export default router;
