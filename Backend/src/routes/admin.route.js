import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.js';

// Existing user management controllers
import {
  getDashboardStats,
  getAllUsers,
  getAdminUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
} from '../controllers/admin.controller.js';

// New product controllers
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';

// New payment controllers
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/payment.controller.js';

const router = Router();

// All admin routes require a valid JWT with isAdmin: true
router.use(requireAdmin);

// ── Dashboard ────────────────────────────────────────────────
router.get('/stats', getDashboardStats);

// ── User management ──────────────────────────────────────────
router.get('/users', getAllUsers);
router.get('/users/:id', getAdminUserById);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

// ── Product management ───────────────────────────────────────
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ── Payment history ──────────────────────────────────────────
router.get('/payments', getAllPayments);
router.get('/payments/:id', getPaymentById);
router.post('/payments', createPayment);
router.patch('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);

export default router;