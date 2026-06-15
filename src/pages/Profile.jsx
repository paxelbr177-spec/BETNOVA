import { useState } from 'react'
import AccountLayout from '../components/AccountLayout.jsx'
import { user } from '../data/account.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'

function Stat({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold ${accent || 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function Profile() {
  const { user: authUser } = useAuth()
  const { bets } = useWallet()
  const [form, setForm] = useState({
    name: authUser?.name || user.name,
    email: authUser?.email || user.email,
    username: authUser?.email?.split('@')[0] || user.username,
  })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setSaved(false) }

  const won = bets.filter((b) => b.status === 'won').length
  const total = bets.filter((b) => b.status !== 'open').length
  const winRate = total ? Math.round((won / total) * 100) : 0

  return (
    <AccountLayout title="Perfil">
      {/* Resumen */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Nivel" value={user.level} accent="text-gold" />
        <Stat label="Apuestas ganadas" value={`${won}/${total}`} accent="text-brand" />
        <Stat label="Tasa de acierto" value={`${winRate}%`} />
        <Stat label="Miembro desde" value={new Date(user.memberSince).toLocaleDateString('es-ES')} />
      </div>

      {/* Progreso de nivel */}
      <div className="card mb-6 p-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-white">Progreso a nivel Oro</span>
          <span className="text-muted">{user.levelProgress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-panel2">
          <div className="h-full rounded-full bg-brand shadow-glow" style={{ width: `${user.levelProgress}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted">Sigue jugando para desbloquear cashback mejorado y retiros prioritarios.</p>
      </div>

      {/* Datos personales */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Datos personales</h2>
          {user.kycVerified && (
            <span className="chip text-brand">✓ Verificado (KYC)</span>
          )}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSaved(true) }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Nombre</label>
            <input className="input" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Usuario</label>
            <input className="input" value={form.username} onChange={set('username')} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary text-sm">Guardar cambios</button>
            {saved && <span className="text-sm text-brand">✓ Guardado</span>}
          </div>
        </form>
      </div>
    </AccountLayout>
  )
}
