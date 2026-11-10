import { Router } from 'express';
import * as c from '../controllers/leaveController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);
router.get('/', c.list);
router.get('/impacted-tasks', allowRoles('admin'), c.impactedTasks);
router.post('/', c.create);
router.put('/:id', allowRoles('admin'), c.updateStatus);
router.delete('/:id', c.remove);
export default router;
