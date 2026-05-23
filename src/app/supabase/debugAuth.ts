'use server';

import { supabaseServer } from '../../../lib/supabaseServer';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function debugAuth() {
  const supabase = await supabaseServer();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log('=== DEBUG AUTH ===');
  console.log('User Error:', userError);
  console.log('User exists:', !!user);
  console.log('User ID:', user?.id);
  console.log('User Email:', user?.email);
  
  // Verificar si el usuario está en admin_users usando supabaseAdmin
  let isInAdminTable = false;
  if (user?.id) {
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('Admin check error:', adminError);
    console.log('Admin data:', adminData);
    isInAdminTable = !!(adminData && adminData.length > 0);
  }
  
  // Intentar consulta con supabase normal (respeta RLS)
  const { data: studentData, error: studentError } = await supabase
    .from('student')
    .select('*')
    .limit(5);
  
  console.log('Student query error:', studentError);
  console.log('Student data count:', studentData?.length || 0);
  
  // Intentar consulta con supabaseAdmin (bypasea RLS)
  const { data: studentAdminData, error: studentAdminError } = await supabaseAdmin
    .from('student')
    .select('*')
    .limit(5);
  
  console.log('Student ADMIN query error:', studentAdminError);
  console.log('Student ADMIN data count:', studentAdminData?.length || 0);
  
  return {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    isInAdminTable,
    studentQueryError: studentError?.message,
    studentDataCount: studentData?.length || 0,
    studentAdminDataCount: studentAdminData?.length || 0,
    canAccessWithRLS: !studentError && studentData && studentData.length > 0,
    canAccessWithAdmin: !studentAdminError && studentAdminData && studentAdminData.length > 0
  };
}