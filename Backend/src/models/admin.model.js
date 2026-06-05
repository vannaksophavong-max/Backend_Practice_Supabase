import supabase from '../database.js';

export const AdminUser = {
  /**
   * Get dashboard statistics
   */
  async getStats() {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (usersError) throw usersError;

    // Get total products count
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (productsError) throw productsError;

    // Get total payments count
    const { count: totalPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });
    if (paymentsError) throw paymentsError;

    // Get new users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const { count: newUsersThisWeek, error: newUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());
    if (newUsersError) throw newUsersError;

    // Get admin count
    const { count: adminCount, error: adminCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);
    if (adminCountError) throw adminCountError;

    // Get all completed payments for accurate revenue calculation
    const { data: allCompleted, error: revErr } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');
    if (revErr) throw revErr;

    const totalRevenue = allCompleted?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0;

    return {
      totalUsers,
      totalProducts,
      totalPayments,
      totalRevenue,
      newUsersThisWeek,
      adminCount,
    };
  },

  /**
   * Get paginated list of all users (admin view)
   */
  async findAll({ page = 1, limit = 20, search = '' }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // Remove password fields from results
    const safeUsers = data?.map(({ password, ...user }) => user) || [];

    return { users: safeUsers, total: count };
  },

  /**
   * Find a single user by ID (admin view)
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update a user by ID (admin only)
   */
  async updateById(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a user by ID (admin only)
   */
  async deleteById(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};