import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthShell, { Link } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const dest = location.state?.from || '/cuenta'
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validate = () => {
    const er = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Introduce un email válido.'
    if (form.password.length < 6) er.password = 'Mínimo 6 caracteres.'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const { error } = await signIn(form)
    setBusy(false)
    if (error) { setErrors({ form: error }); return }
    setSent(true)
    setTimeout(() => navigate(dest, { replace: true }), 700)
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta para seguir jugando."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-brand hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-xl bg-brand/10 p-4 text-center text-brand">
          ✓ Sesión iniciada. Redirigiendo…
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm text-slate-300">Contraseña</label>
              <a href="#" className="text-xs text-brand hover:underline">¿Olvidaste?</a>
            </div>
            <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-panel2 accent-brand" />
            Recuérdame
          </label>
          {errors.form && (
            <p className="rounded-lg bg-red-500/10 p-2.5 text-center text-sm text-red-400">{errors.form}</p>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
