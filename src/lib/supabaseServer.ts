import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL. Por favor, configúrala en tu archivo .env.local.'
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    'Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY. Por favor, configúrala en tu archivo .env.local para permitir consultas seguras desde el servidor.'
  );
}

// Inicialización del cliente exclusivo del servidor.
// Se utiliza la Service Role Key para saltar políticas RLS al consultar el stock internamente.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // No persistir sesión en un entorno de servidor
    autoRefreshToken: false,
  },
});
