import { Router } from 'express';
import * as c from '../controllers/employeeController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, allowRoles('admin'));
router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
