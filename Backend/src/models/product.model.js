import supabase from '../database.js';

export const Product = {
  /** Paginated list with optional search and category filter */
  async findAll({ page = 1, limit = 20, search = '', category = '', activeOnly = false }) {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search)     query = query.ilike('name', `%${search}%`);
    if (category)   query = query.eq('category', category);
    if (activeOnly) query = query.eq('is_active', true);

    const { data, error, count } = await query;
    if (error) throw error;
    return { products: data, total: count };
  },

  /** Find a single product by id */
  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Create a new product */
  async create({ name, description, price, stock, category, image_url, is_active }) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, description, price, stock, category, image_url, is_active }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update a product by id */
  async updateById(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Soft-delete: set is_active = false */
  async deactivate(id) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Hard-delete a product */
  async deleteById(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  /** Get product stats for admin dashboard */
  async getStats() {
    const { count: total, error: totalErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (totalErr) throw totalErr;

    const { count: active, error: activeErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    if (activeErr) throw activeErr;

    // Low stock: 5 or fewer
    const { count: lowStock, error: stockErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock', 5)
      .eq('is_active', true);
    if (stockErr) throw stockErr;

    return { total, active, inactive: total - active, lowStock };
  },
};
