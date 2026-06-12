import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell, { Link } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function strength(pw) {
  let s = 0
  if (pw.length >= 6) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s // 0..4
}

const bars = ['bg-red-500', 'bg-orange-500', 'bg-gold', 'bg-brand']
const labels = ['Débil', 'Aceptable', 'Buena', 'Fuerte']

export default function Register() {
  const navigate = useNavigate()
  const { signUp, isMock } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', age: false, terms: false })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const validate = () => {
    const er = {}
    if (form.name.trim().length < 2) er.name = 'Indica tu nombre.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Email inválido.'
    if (strength(form.password) < 2) er.password = 'Contraseña demasiado débil.'
    if (!form.age) er.age = 'Debes confirmar que eres mayor de 18.'
    if (!form.terms) er.terms = 'Acepta los términos para continuar.'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const { error, needsConfirmation } = await signUp({ name: form.name, email: form.email, password: form.password })
    setBusy(false)
    if (error) { setErrors({ form: error }); return }
    setDone(needsConfirmation ? 'confirm' : 'ok')
    // Si Supabase pide confirmar email -> al login; si no (o modo local) -> a la cuenta.
    setTimeout(() => navigate(needsConfirmation ? '/login' : '/cuenta', { replace: true }), 1400)
  }

  const s = strength(form.password)

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate gratis y reclama tu bono de bienvenida."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {done ? (
        <div className="rounded-xl bg-brand/10 p-4 text-center text-brand">
          {done === 'confirm'
            ? '📧 ¡Cuenta creada! Revisa tu email para confirmarla y luego inicia sesión.'
            : '🎉 ¡Cuenta creada! Entrando…'}
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Nombre</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Tu nombre" />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Contraseña</label>
            <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Crea una contraseña" />
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={`h-1.5 flex-1 rounded-full ${i < s ? bars[s - 1] : 'bg-white/10'}`} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted">Seguridad: {labels[Math.max(0, s - 1)]}</p>
              </div>
            )}
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
          </div>

          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.age} onChange={set('age')} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-panel2 accent-brand" />
            Confirmo que soy mayor de 18 años.
          </label>
          {errors.age && <p className="-mt-2 text-xs text-red-400">{errors.age}</p>}

          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.terms} onChange={set('terms')} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-panel2 accent-brand" />
            Acepto los términos y la política de privacidad.
          </label>
          {errors.terms && <p className="-mt-2 text-xs text-red-400">{errors.terms}</p>}

          {errors.form && (
            <p className="rounded-lg bg-red-500/10 p-2.5 text-center text-sm text-red-400">{errors.form}</p>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
