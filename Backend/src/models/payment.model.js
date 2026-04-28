import supabase from '../database.js';

export const Payment = {
  /** Paginated list of all payments with optional filters */
  async findAll({ page = 1, limit = 20, status = '', userId = '' }) {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabase
      .from('payments')
      .select(
        `id, amount, currency, status, payment_method, reference, notes, created_at, updated_at,
         user_id, product_id,
         users ( id, username, email ),
         products ( id, name, price )`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (userId) query = query.eq('user_id', userId);

    const { data, error, count } = await query;
    if (error) throw error;
    return { payments: data, total: count };
  },

  /** Find a single payment by id */
  async findById(id) {
    const { data, error } = await supabase
      .from('payments')
      .select(
        `*, users ( id, username, email ), products ( id, name, price )`
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Create a payment record */
  async create({ user_id, product_id, amount, currency, status, payment_method, reference, notes }) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ user_id, product_id, amount, currency, status, payment_method, reference, notes }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update a payment (e.g. change status) */
  async updateById(id, updates) {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Delete a payment record */
  async deleteById(id) {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  },

  /** Revenue & payment stats for the admin dashboard */
  async getStats() {
    // Total revenue (completed payments)
    const { data: revenueData, error: revErr } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');
    if (revErr) throw revErr;
    const totalRevenue = revenueData.reduce((sum, p) => sum + Number(p.amount), 0);

    // Counts by status
    const statuses = ['pending', 'completed', 'failed', 'refunded'];
    const counts = {};
    for (const s of statuses) {
      const { count, error } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', s);
      if (error) throw error;
      counts[s] = count;
    }

    // Revenue in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentData, error: recentErr } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo);
    if (recentErr) throw recentErr;
    const revenueThisMonth = recentData.reduce((sum, p) => sum + Number(p.amount), 0);

    return { totalRevenue, revenueThisMonth, counts };
  },
};
