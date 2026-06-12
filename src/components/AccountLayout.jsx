import { NavLink } from 'react-router-dom'
import { user } from '../data/account.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'

const items = [
  { to: '/cuenta', end: true, label: 'Perfil', icon: '👤' },
  { to: '/cuenta/billetera', label: 'Billetera', icon: '💰' },
  { to: '/cuenta/apuestas', label: 'Mis apuestas', icon: '🎟️' },
]

const fmt = (n) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function AccountLayout({ title, children }) {
  const { user: authUser } = useAuth()
  const { balance, bonus } = useWallet()
  const [a, b] = user.avatarColors
  const name = authUser?.name || user.name
  const username = authUser?.email?.split('@')[0] || user.username
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-full font-display font-bold text-ink"
                style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-white">{name}</p>
                <p className="truncate text-xs text-muted">@{username}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-panel2 p-3">
              <p className="text-xs text-muted">Saldo disponible</p>
              <p className="font-display text-xl font-extrabold text-brand">
                ${fmt(balance)}
              </p>
              <p className="mt-0.5 text-xs text-gold">+ ${fmt(bonus)} bono</p>
            </div>
          </div>

          <nav className="card overflow-hidden p-2">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-white/5 text-brand' : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                <span>{it.icon}</span> {it.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section>
          <h1 className="mb-6 font-display text-3xl font-extrabold text-white">{title}</h1>
          {children}
        </section>
      </div>
    </div>
  )
}

export { fmt }
