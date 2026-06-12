import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { user as account } from '../data/account.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/casino', label: 'Casino' },
  { to: '/deportes', label: 'Deportes' },
  { to: '/promociones', label: 'Promociones' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { balance: walletBalance } = useWallet()
  const loggedIn = Boolean(user)

  // Avatar e iniciales derivados del usuario autenticado.
  const [a, b] = account.avatarColors
  const initials = (user?.name || 'J')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  // Saldo real desde la billetera (Supabase o local por usuario).
  const balance = walletBalance.toLocaleString('es-ES', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })

  const handleLogout = async () => { setOpen(false); await signOut(); navigate('/') }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="BetNova inicio">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-white/5 text-brand' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <>
              <Link
                to="/cuenta/billetera"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-panel px-3 py-2 text-sm transition hover:border-brand/40"
              >
                <span className="text-muted">Saldo</span>
                <span className="font-display font-bold text-brand">${balance}</span>
                <span className="ml-1 grid h-6 w-6 place-items-center rounded-lg bg-brand text-ink">+</span>
              </Link>
              <Link to="/cuenta" aria-label="Mi cuenta" title={user.email}>
                <span
                  className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-bold text-ink ring-2 ring-transparent transition hover:ring-brand/50"
                  style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
                >
                  {initials}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm" title="Cerrar sesión">
                Salir
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost text-sm">
                Iniciar sesión
              </button>
              <button onClick={() => navigate('/registro')} className="btn-primary text-sm">
                Registrarse
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 md:hidden"
          aria-label="Abrir menú"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-panel md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col p-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-white/5 text-brand' : 'text-slate-300'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="my-2 h-px bg-white/5" />
            {loggedIn ? (
              <>
                <NavLink to="/cuenta" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-300">
                  👤 Mi perfil
                </NavLink>
                <NavLink to="/cuenta/billetera" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-300">
                  💰 Billetera · ${balance}
                </NavLink>
                <NavLink to="/cuenta/apuestas" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-300">
                  🎟️ Mis apuestas
                </NavLink>
                <button onClick={handleLogout} className="mt-1 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-400">
                  🚪 Cerrar sesión
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => { setOpen(false); navigate('/login') }} className="btn-ghost text-sm">
                  Iniciar sesión
                </button>
                <button onClick={() => { setOpen(false); navigate('/registro') }} className="btn-primary text-sm">
                  Registrarse
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
