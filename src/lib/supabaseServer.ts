import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Inicialización lazy del cliente de Supabase.
// No lanza errores al cargar el módulo (lo que rompe el build de Next.js/Vercel),
// sino únicamente cuando se intenta usar el cliente en tiempo de ejecución.

let _client: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL. Por favor, configúrala en Vercel → Settings → Environment Variables.'
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY. Por favor, configúrala en Vercel → Settings → Environment Variables.'
    );
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _client;
}

// Exportamos también como alias para no romper imports existentes
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseServer() as any)[prop];
  },
});
