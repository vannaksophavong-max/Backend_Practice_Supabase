import { requireAuth } from '../middleware/auth.js';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createUser, getUserById, loginUser, logoutUser } from '../controllers/user.controller.js';
import { getAllProducts } from '../controllers/product.controller.js';

const router = Router();
const productRouter = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/', authLimiter, createUser);
router.post('/login', loginUser);
router.post('/logout', requireAuth, logoutUser);
router.get('/:id', requireAuth, getUserById);

productRouter.get('/', getAllProducts);

export { router as userRouter, productRouter };