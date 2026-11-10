import { Router } from 'express';
import * as c from '../controllers/statsController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = Router();
router.get('/public', c.publicQueue);
router.get('/admin', verifyToken, allowRoles('admin'), c.admin);
router.get('/me', verifyToken, c.me);
export default router;
