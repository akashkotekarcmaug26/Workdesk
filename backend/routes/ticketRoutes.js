import { Router } from 'express';
import * as c from '../controllers/ticketController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);
router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', allowRoles('admin'), c.remove);
router.post('/:id/messages', c.addMessage);
export default router;
