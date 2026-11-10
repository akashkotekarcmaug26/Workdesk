import { Router } from 'express';
import * as c from '../controllers/reviewController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);
router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', allowRoles('admin'), c.create);
router.put('/:id', allowRoles('admin'), c.update);
router.delete('/:id', allowRoles('admin'), c.remove);
export default router;
