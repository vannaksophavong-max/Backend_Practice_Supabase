import { Product } from '../models/product.model.js';
import { z } from 'zod';

const productSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price:       z.number().min(0),
  stock:       z.number().int().min(0).default(0),
  category:    z.string().max(100).optional(),
  image_url:   z.string().url().optional().or(z.literal('')),
  is_active:   z.boolean().default(true),
});

const updateProductSchema = productSchema.partial();

// ── GET /api/v1/admin/products ─────────────────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)  || 1);
    const limit     = Math.min(100, parseInt(req.query.limit) || 20);
    const search    = req.query.search?.trim()   || '';
    const category  = req.query.category?.trim() || '';
    const activeOnly = req.query.active === 'true';

    const { products, total } = await Product.findAll({ page, limit, search, category, activeOnly });

    res.status(200).json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── GET /api/v1/admin/products/:id ────────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── POST /api/v1/admin/products ───────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const product = await Product.create(parsed.data);
    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── PATCH /api/v1/admin/products/:id ─────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found.' });

    const updated = await Product.updateById(req.params.id, parsed.data);
    res.status(200).json({ message: 'Product updated successfully.', product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ── DELETE /api/v1/admin/products/:id ────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found.' });

    await Product.deleteById(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
