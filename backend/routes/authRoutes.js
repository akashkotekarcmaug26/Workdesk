import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me);
router.put('/me', verifyToken, updateProfile);
export default router;
