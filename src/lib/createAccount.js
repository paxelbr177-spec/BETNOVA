import { supabase, createTempClient } from './supabase.js'
import { usernameToEmail, slugUsername } from './players.js'

// Crea una cuenta (usuario / agente / administrador) sin tocar la sesión actual.
// roles: 'user' (normal), 'agent' (is_agent), 'admin' (is_agent + can_create_agents).
// Permisos reales los valida la RPC en la BD según quién llama.
export async function createAccount({ username, name, password, role = 'user' }) {
  const uname = slugUsername(username)
  if (uname.length < 3) return { error: 'El usuario debe tener al menos 3 caracteres (letras/números).' }
  if ((password || '').length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }

  const asAgent = role === 'agent' || role === 'admin'
  const canCreateAgents = role === 'admin'
  const email = usernameToEmail(uname)

  // 1) Crear la cuenta en un cliente desechable (no reemplaza la sesión del que crea).
  const temp = createTempClient()
  const { error: suErr } = await temp.auth.signUp({ email, password, options: { data: { name: name || uname } } })
  if (suErr) {
    return { error: suErr.message?.toLowerCase().includes('already') ? 'Ese usuario ya existe. Elegí otro.' : suErr.message }
  }
  // 2) Vincular + asignar rol (la RPC valida permisos del que llama).
  const { error: linkErr } = await supabase.rpc('agent_create_player', {
    p_email: email, p_username: uname, p_name: name || uname,
    p_as_agent: asAgent, p_can_create_agents: canCreateAgents,
  })
  try { await temp.auth.signOut() } catch { /* noop */ }
  if (linkErr) return { error: linkErr.message }
  return { username: uname }
}
