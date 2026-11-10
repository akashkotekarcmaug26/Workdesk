import { Router } from 'express';
import * as c from '../controllers/contactController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = Router();
router.post('/', c.create);
router.get('/', verifyToken, allowRoles('admin'), c.list);
router.delete('/:id', verifyToken, allowRoles('admin'), c.remove);
export default router;
