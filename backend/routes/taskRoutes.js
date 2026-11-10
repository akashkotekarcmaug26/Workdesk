import { Router } from 'express';
import * as c from '../controllers/taskController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);
router.get('/recommendations', allowRoles('admin'), c.recommendAssignees);
router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', allowRoles('admin'), c.create);
router.put('/:id', c.update);
router.delete('/:id', allowRoles('admin'), c.remove);
export default router;
