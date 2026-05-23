import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required (NEXT_PUBLIC_SUPABASE_URL)');
}

if (!serviceRoleKey) {
  // Evita que falle silenciosamente en runtime sin env. Esto ayuda a diagnosticar en local/deploy.
  throw new Error(
    'Missing env var: SUPABASE_SERVICE_ROLE_KEY. ' +
      'Set it in your environment (server-side only). '
  );
}


export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
