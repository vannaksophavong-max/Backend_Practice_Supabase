import { User } from '../models/user.model.js';
import { AdminUser } from '../models/admin.model.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// ── GET /api/v1/admin/stats ────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await AdminUser.getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── GET /api/v1/admin/users ────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const search = req.query.search?.trim() || '';

    const { users, total } = await AdminUser.findAll({ page, limit, search });

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── GET /api/v1/admin/users/:id ───────────────────────────────────────────
export const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { password: _, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── PATCH /api/v1/admin/users/:id ────────────────────────────────────────
const updateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email:    z.string().email().max(100).optional(),
  isAdmin:  z.boolean().optional(),
}).strict();

export const updateUser = async (req, res) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const updated = await User.updateById(req.params.id, parsed.data);
    const { password: _, ...safeUser } = updated;
    res.status(200).json({ message: 'User updated successfully.', user: safeUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── PATCH /api/v1/admin/users/:id/reset-password ─────────────────────────
const resetPwSchema = z.object({
  newPassword: z.string().min(8).max(72),
});

export const resetUserPassword = async (req, res) => {
  try {
    const parsed = resetPwSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
    await User.updateById(req.params.id, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── DELETE /api/v1/admin/users/:id ────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await User.deleteById(req.params.id);
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
