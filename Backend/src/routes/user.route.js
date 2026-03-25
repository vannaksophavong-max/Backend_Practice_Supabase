import { requireAuth } from '../middleware/auth.js';
import { Router } from 'express';
import { createUser, getUserById, loginUser, logoutUser } from '../controllers/user.controller.js';

const router = Router();

router.post('/', createUser);
router.post('/login', loginUser);
router.post('/logout', requireAuth, logoutUser);
router.get('/:id', requireAuth, getUserById);

export default router;