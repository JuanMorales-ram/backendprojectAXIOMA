'use server';

import { supabaseServer } from '../../../lib/supabaseServer';
import { requireAdmin } from '../../../lib/authorization';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  user_id: string;
  username: string;
  password: string;
  Rol: boolean;
}

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from('admin_users').select('*');
  if (error) { console.error('Error fetching admin users:', error); return []; }
  return data;
};

export const addAdminUser = async (user: AdminUser): Promise<{ success: boolean; error?: string }> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const supabase = await supabaseServer();
  // Hash password before inserting
  const hash = await bcrypt.hash(user.password, 10);
  const payload = { ...user, password: hash, Rol: true };
  const { error } = await supabase.from('admin_users').insert([payload]);
  if (error) { 
    console.error('Error adding admin user:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const updateAdminUser = async (user: AdminUser): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const supabase = await supabaseServer();
  // If password looks already hashed (starts with $2a/$2b), keep it; else hash
  const needsHash = !user.password.startsWith('$2');
  const payload = needsHash ? { ...user, password: await bcrypt.hash(user.password, 10) } : user;
  const { error } = await supabase.from('admin_users').update(payload).eq('userid', user.user_id);
  if (error) { console.error('Error updating admin user:', error); }
};

export const deleteAdminUser = async (userid: string): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const supabase = await supabaseServer();
  const { error } = await supabase.from('admin_users').delete().eq('userid', userid);
  if (error) { console.error('Error deleting admin user:', error); }
};

// Helper to fetch a user by username (for login)
export const getAdminUserByUsername = async (username: string): Promise<AdminUser | null> => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from('admin_users').select('*').eq('username', username).maybeSingle();
  if (error) { console.error('Error fetching admin user by username:', error); return null; }
  return data as AdminUser | null;
};

// Verify a password against a possibly hashed stored password.
// Supports legacy plaintext (temporary) and bcrypt hash.
export const verifyPassword = async (inputPassword: string, storedPassword: string): Promise<boolean> => {
  if (!storedPassword) return false;
  if (storedPassword.startsWith('$2')) {
    try { return await bcrypt.compare(inputPassword, storedPassword); } catch { return false; }
  }
  // Legacy plaintext fallback
  return inputPassword === storedPassword;
};
