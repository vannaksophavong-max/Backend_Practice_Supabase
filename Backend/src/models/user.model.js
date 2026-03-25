import supabase from '../database.js';

/**
 * User model - wraps Supabase queries for the `users` table.
 *
 * Expected Supabase table schema (run in SQL editor):
 *
 * create table users (
 *   id          uuid primary key default gen_random_uuid(),
 *   username    text not null unique,
 *   email       text not null unique,
 *   password    text not null,
 *   created_at  timestamptz default now(),
 *   updated_at  timestamptz default now()
 * );
 */

export const User = {
  /** Find a single user by a field, e.g. { username: 'alice' } or { email: '...' } */
  async findOne(fields) {
    let query = supabase.from('users').select('*');
    for (const [key, value] of Object.entries(fields)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Find a user where username OR email matches (mirrors Mongoose $or) */
  async findOneByUsernameOrEmail(username, email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Find a user by their UUID */
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Create a new user row */
  async create({ username, email, password }) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          password,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update a user by id */
  async updateById(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Delete a user by id */
  async deleteById(id) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },
};
