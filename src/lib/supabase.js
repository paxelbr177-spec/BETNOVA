import { createClient } from '@supabase/supabase-js'

// Lee las credenciales de Supabase desde variables de entorno (.env).
// Si NO existen, la app usa un "modo local" (localStorage) para que el login
// funcione en el demo sin configurar nada. Al añadir las claves, pasa a real.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(url && anonKey)

export const supabase = hasSupabase
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
