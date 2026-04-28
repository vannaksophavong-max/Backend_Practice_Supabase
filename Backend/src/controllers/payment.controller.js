import { Payment } from '../models/payment.model.js';
import { z } from 'zod';

const paymentSchema = z.object({
  user_id:        z.string().uuid(),
  product_id:     z.string().uuid().optional(),
  amount:         z.number().min(0),
  currency:       z.string().length(3).default('USD'),
  status:         z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  payment_method: z.string().max(50).optional(),
  reference:      z.string().max(200).optional(),
  notes:          z.string().max(1000).optional(),
});

const updatePaymentSchema = z.object({
  status:         z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  payment_method: z.string().max(50).optional(),
  reference:      z.string().max(200).optional(),
  notes:          z.string().max(1000).optional(),
}).strict();

// ── GET /api/v1/admin/payments ────────────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const status = req.query.status?.trim() || '';
    const userId = req.query.user_id?.trim() || '';

    const { payments, total } = await Payment.findAll({ page, limit, status, userId });

    res.status(200).json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── GET /api/v1/admin/payments/:id ───────────────────────────────────────
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── POST /api/v1/admin/payments ───────────────────────────────────────────
export const createPayment = async (req, res) => {
  try {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const payment = await Payment.create(parsed.data);
    res.status(201).json({ message: 'Payment record created successfully.', payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    // Unique constraint on reference field
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Payment reference already exists.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── PATCH /api/v1/admin/payments/:id ─────────────────────────────────────
export const updatePayment = async (req, res) => {
  try {
    const parsed = updatePaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const existing = await Payment.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Payment not found.' });

    const updated = await Payment.updateById(req.params.id, parsed.data);
    res.status(200).json({ message: 'Payment updated successfully.', payment: updated });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── DELETE /api/v1/admin/payments/:id ────────────────────────────────────
export const deletePayment = async (req, res) => {
  try {
    const existing = await Payment.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Payment not found.' });

    await Payment.deleteById(req.params.id);
    res.status(200).json({ message: 'Payment record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
