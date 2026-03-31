import supabase from '../database.js';

export const AdminUser = {
  /**
   * Paginated list of all users with optional search.
   * Returns users without their password field.
   */
  async findAll({ page = 1, limit = 20, search = '' }) {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabase
      .from('users')
      .select('id, username, email, is_admin, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { users: data, total: count };
  },

  /**
   * Aggregate stats for the dashboard overview card.
   */
  async getStats() {
    // Total users
    const { count: totalUsers, error: countErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (countErr) throw countErr;

    // New users in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersThisWeek, error: newErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);
    if (newErr) throw newErr;

    // Admin users count
    const { count: adminCount, error: adminErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);
    if (adminErr) throw adminErr;

    return {
      totalUsers,
      newUsersThisWeek,
      adminCount,
    };
  },
};
