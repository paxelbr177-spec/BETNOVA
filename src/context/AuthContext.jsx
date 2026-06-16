import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, hasSupabase } from '../lib/supabase.js'
import { loginToEmail } from '../lib/players.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Normaliza el usuario a una forma común { email, name } sin importar el modo.
function normalize(u) {
  if (!u) return null
  if (u.user_metadata) {
    // usuario de Supabase
    return { email: u.email, name: u.user_metadata.name || u.email?.split('@')[0] || 'Jugador' }
  }
  return { email: u.email, name: u.name || u.email?.split('@')[0] || 'Jugador' }
}

// Traduce los errores de Supabase (en inglés) a mensajes amigables en español.
function friendly(msg) {
  const m = (msg || '').toLowerCase()
  if (m.includes('email not confirmed')) return 'Debes confirmar tu email antes de entrar. Revisa tu bandeja de entrada.'
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (m.includes('already registered') || m.includes('already exists')) return 'Ya existe una cuenta con ese email.'
  if (m.includes('password should be at least')) return 'La contraseña es demasiado corta.'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Email inválido.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (m.includes('signups are disabled') || m.includes('signups not allowed')) return 'El registro está deshabilitado en la configuración de Supabase.'
  return msg
}

// ---- Modo local (localStorage) para el demo sin backend ----
const LS_USERS = 'betnova_users'
const LS_SESSION = 'betnova_session'
const readUsers = () => JSON.parse(localStorage.getItem(LS_USERS) || '[]')
const writeUsers = (u) => localStorage.setItem(LS_USERS, JSON.stringify(u))

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // true cuando el usuario llega desde un enlace de "recuperar contraseña"
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (hasSupabase) {
      supabase.auth.getSession().then(({ data }) => {
        setUser(normalize(data.session?.user))
        setLoading(false)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(normalize(session?.user))
        if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      })
      return () => sub.subscription.unsubscribe()
    }
    // modo local
    const s = JSON.parse(localStorage.getItem(LS_SESSION) || 'null')
    setUser(normalize(s))
    setLoading(false)
  }, [])

  async function signUp({ name, email, password }) {
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) return { error: friendly(error.message) }
      // Si hay sesión, la confirmación de email está desactivada => entra directo.
      return { needsConfirmation: !data.session }
    }
    // local: registrar y dejar sesión iniciada
    const users = readUsers()
    if (users.some((u) => u.email === email)) return { error: 'Ya existe una cuenta con ese email.' }
    const account = { name, email, password }
    users.push(account)
    writeUsers(users)
    localStorage.setItem(LS_SESSION, JSON.stringify({ name, email }))
    setUser(normalize({ name, email }))
    return {}
  }

  async function signIn({ email, password }) {
    if (hasSupabase) {
      // Acepta email o "usuario" (jugadores creados por un agente entran con usuario).
      const { error } = await supabase.auth.signInWithPassword({ email: loginToEmail(email), password })
      if (error) return { error: friendly(error.message) }
      return {}
    }
    const users = readUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) return { error: 'Email o contraseña incorrectos.' }
    localStorage.setItem(LS_SESSION, JSON.stringify({ name: found.name, email: found.email }))
    setUser(normalize(found))
    return {}
  }

  async function signOut() {
    if (hasSupabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(LS_SESSION)
      setUser(null)
    }
  }

  // Envía el email con el enlace para crear una nueva contraseña.
  async function resetPassword(email) {
    if (hasSupabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/recuperar',
      })
      if (error) return { error: friendly(error.message) }
      return {}
    }
    return { error: 'La recuperación por email solo funciona con la configuración real (Supabase).' }
  }

  // Define la nueva contraseña (el usuario llegó desde el enlace del email).
  async function updatePassword(newPassword) {
    if (hasSupabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { error: friendly(error.message) }
      return {}
    }
    return { error: 'No disponible en modo local.' }
  }

  const clearRecovery = () => setRecovery(false)

  return (
    <AuthContext.Provider
      value={{ user, loading, recovery, signUp, signIn, signOut, resetPassword, updatePassword, clearRecovery, isMock: !hasSupabase }}
    >
      {children}
    </AuthContext.Provider>
  )
}
