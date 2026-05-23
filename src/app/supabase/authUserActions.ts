'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../lib/authorization';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export const fetchAuthUsers = async (): Promise<AuthUser[]> => {
  try {
    // Verificar que el usuario sea administrador
    await requireAdmin();
    
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching auth users:', error);
      return [];
    }

    return data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at
    }));
  } catch (error) {
    console.error('Error fetching auth users:', error);
    // Re-throw authentication/authorization errors
    if (error instanceof Error && (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')) {
      throw error;
    }
    return [];
  }
};

export const addAuthUser = async (email: string, password: string): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    // Verificar que el usuario sea administrador
    await requireAdmin();
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    console.log('addAuthUser response:', { data, error });
    if (error) {
      console.error('Error adding auth user:', error);
      return { success: false, error: error.message };
    }

    return { success: true, userId: data.user.id };  // ← Aquí devuelves el userId
  } catch (error) {
    console.error('Error adding auth user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return { success: false, error: errorMessage };
  }
};

export const updateAuthUserPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verificar que el usuario sea administrador
    await requireAdmin();
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error('Error updating auth user password:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating auth user password:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return { success: false, error: errorMessage };
  }
};

export const deleteAuthUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verificar que el usuario sea administrador
    await requireAdmin();
    
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting auth user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting auth user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return { success: false, error: errorMessage };
  }
};

export const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verificar que el usuario sea administrador
    await requireAdmin();
    
    // En lugar de generar un link, podemos invitar al usuario nuevamente
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (error) {
      console.error('Error sending invitation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending invitation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return { success: false, error: errorMessage };
  }
};