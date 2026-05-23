'use server';

import { supabaseServer } from './supabaseServer';
import { supabaseAdmin } from './supabaseAdmin';
import { AuthenticationError, AuthorizationError } from './errors';

/**
 * Verifica si el usuario actual está autenticado
 * @returns El user object si está autenticado, null si no
 */
export async function requireAuth() {
  const supabase = await supabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  
  if (error || !user) {
    throw new AuthenticationError();
  }
  
  return user;
}

/**
 * Verifica si el usuario actual es un administrador
 * @returns true si es admin, lanza error si no
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  // Verificar si el usuario está en la tabla admin_users
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) {
    console.error('Error verificando permisos de administrador:', error);
    throw new Error('Error verificando permisos');
  }
  
  if (!data) {
    throw new AuthorizationError();
  }
  
  return user;
}

/**
 * Verifica si el usuario actual es un administrador (sin lanzar error)
 * @returns true si es admin, false si no
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    
    if (!user) {
      return false;
    }
    
    const { data } = await supabaseAdmin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Obtiene el usuario actual autenticado
 * @returns user object o null
 */
export async function getCurrentUser() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Obtiene el ID del usuario actual
 * @returns user ID o null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}
