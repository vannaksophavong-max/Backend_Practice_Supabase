import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.js';
import {
  getDashboardStats,
  getAllUsers,
  getAdminUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require a valid JWT with isAdmin: true
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users',              getAllUsers);
router.get('/users/:id',          getAdminUserById);
router.patch('/users/:id',        updateUser);
router.patch('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id',       deleteUser);

export default router;
