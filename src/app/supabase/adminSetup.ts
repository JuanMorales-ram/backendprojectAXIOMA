'use server';

import { supabaseServer } from '../../../lib/supabaseServer';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function addCurrentUserAsAdmin() {
  try {
    const supabase = await supabaseServer();
    
    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user:', userError);
      return { 
        success: false, 
        error: 'No hay usuario autenticado' 
      };
    }

    const userId = user.id;
    const userEmail = user.email;

    // Usar supabaseAdmin para insertar en admin_users (bypasea RLS)
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert([
        { 
          user_id: userId,
          email: userEmail,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error adding admin user:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return { 
      success: true, 
      data,
      userId,
      userEmail
    };
  } catch (error) {
    console.error('Error in addCurrentUserAsAdmin:', error);
    return { 
      success: false, 
      error: 'Error interno del servidor' 
    };
  }
}

export async function checkIfUserIsAdmin() {
  try {
    const supabase = await supabaseServer();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        isAdmin: false, 
        error: 'No hay usuario autenticado' 
      };
    }

    const userId = user.id;

    // Usar supabaseAdmin para verificar (bypasea RLS)
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking admin status:', error);
      return { 
        isAdmin: false, 
        error: error.message 
      };
    }

    return { 
      isAdmin: !!data,
      userId,
      userEmail: user.email,
      adminData: data
    };
  } catch (error) {
    console.error('Error in checkIfUserIsAdmin:', error);
    return { 
      isAdmin: false, 
      error: 'Error interno del servidor' 
    };
  }
}