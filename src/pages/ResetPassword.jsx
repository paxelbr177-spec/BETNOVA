import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell, { Link } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ResetPassword() {
  const { recovery, resetPassword, updatePassword, clearRecovery } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(null)
  const [busy, setBusy] = useState(false)

  // Llegó desde el enlace del email → definir nueva contraseña
  if (recovery) {
    const save = async (e) => {
      e.preventDefault()
      setErr(null)
      if (pw.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.')
      if (pw !== pw2) return setErr('Las contraseñas no coinciden.')
      setBusy(true)
      const { error } = await updatePassword(pw)
      setBusy(false)
      if (error) return setErr(error)
      clearRecovery()
      setDone('✓ Contraseña actualizada. Redirigiendo…')
      setTimeout(() => navigate('/cuenta', { replace: true }), 1200)
    }
    return (
      <AuthShell title="Nueva contraseña" subtitle="Elegí tu nueva contraseña para BetNova.">
        {done ? (
          <div className="rounded-xl bg-brand/10 p-4 text-center text-brand">{done}</div>
        ) : (
          <form onSubmit={save} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Nueva contraseña</label>
              <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Repetir contraseña</label>
              <input className="input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" />
            </div>
            {err && <p className="rounded-lg bg-red-500/10 p-2.5 text-center text-sm text-red-400">{err}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </AuthShell>
    )
  }

  // Pedir el enlace de recuperación por email
  const request = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Introduce un email válido.')
    setBusy(true)
    const { error } = await resetPassword(email)
    setBusy(false)
    if (error) return setErr(error)
    setDone('✓ Te enviamos un email con el enlace para crear tu nueva contraseña. Revisá tu bandeja (y la carpeta de spam).')
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviamos un enlace para crear una nueva."
      footer={
        <>
          ¿La recordaste?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">Iniciar sesión</Link>
        </>
      }
    >
      {done ? (
        <div className="rounded-xl bg-brand/10 p-4 text-center text-brand">{done}</div>
      ) : (
        <form onSubmit={request} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>
          {err && <p className="rounded-lg bg-red-500/10 p-2.5 text-center text-sm text-red-400">{err}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
