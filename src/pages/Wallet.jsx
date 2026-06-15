import { useState } from 'react'
import AccountLayout, { fmt } from '../components/AccountLayout.jsx'
import { user } from '../data/account.js'
import { useWallet } from '../context/WalletContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Montos fijos para recargar (ARS).
const AMOUNTS = [2000, 5000, 10000, 20000]

// Cajeros: reciben la transferencia por Mercado Pago y cargan el saldo desde el panel.
const CASHIERS = [
  { role: 'Cajero', name: 'Alejo', phone: '5493537572295', display: '+54 9 3537 572295' },
  { role: 'Cajera', name: 'Candela', phone: '5493537601536', display: '+54 9 3537 601536' },
]

// Link de WhatsApp con un mensaje prellenado (usuario + monto).
const waLink = (phone, username, amount) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(
    `Hola, soy ${username} y quiero cargar $${amount.toLocaleString('es-ES')} ARS en BetNova.`,
  )}`

const typeMeta = {
  deposit: { label: 'Depósito', cls: 'text-brand' },
  withdraw: { label: 'Retiro', cls: 'text-red-400' },
  bet: { label: 'Apuesta', cls: 'text-slate-300' },
  win: { label: 'Premio', cls: 'text-brand' },
}

const statusMeta = {
  ok: { label: 'Completado', cls: 'bg-brand/15 text-brand' },
  pending: { label: 'Pendiente', cls: 'bg-gold/15 text-gold' },
  failed: { label: 'Fallido', cls: 'bg-red-500/15 text-red-400' },
}

export default function Wallet() {
  const { balance, bonus, transactions } = useWallet()
  const { user: authUser } = useAuth()
  const [selected, setSelected] = useState(null) // monto elegido para el pop-up
  const username = authUser?.name || authUser?.email || 'usuario'

  return (
    <AccountLayout title="Billetera">
      {/* Tarjetas de saldo */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card bg-hero-grid p-5">
          <p className="text-xs text-muted">Saldo total</p>
          <p className="font-display text-2xl font-extrabold text-white">${fmt(balance)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted">Bono activo</p>
          <p className="font-display text-2xl font-extrabold text-gold">${fmt(bonus)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted">Moneda</p>
          <p className="font-display text-2xl font-extrabold text-white">{user.currency}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Recargar saldo (vía cajero por WhatsApp) */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-white">Recargar saldo</h2>
          <p className="mt-1 text-sm text-muted">Elegí un monto y contactá a un cajero por WhatsApp.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelected(amount)}
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-panel2 p-4 transition hover:border-brand/50 hover:bg-brand/5"
              >
                <span className="text-2xl">💳</span>
                <span className="font-display text-lg font-extrabold text-white">${amount.toLocaleString('es-ES')}</span>
                <span className="text-[11px] text-muted">ARS · Cargar</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-panel2 p-3 text-xs text-muted">
            Transferí por Mercado Pago al cajero y avisale por WhatsApp con <b className="text-white">tu usuario</b> y el monto.
            Él acreditará tu saldo. Los retiros también se gestionan con un cajero.
          </div>
        </div>

        {/* Transacciones */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-white">Movimientos recientes</h2>
          <div className="-mx-2 divide-y divide-white/5">
            {transactions.map((t) => {
              const tm = typeMeta[t.type]
              const sm = statusMeta[t.status]
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 px-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{tm.label}</p>
                    <p className="truncate text-xs text-muted">{t.method} · {t.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-sm font-bold ${t.amount >= 0 ? 'text-brand' : 'text-slate-200'}`}>
                      {t.amount >= 0 ? '+' : ''}${fmt(Math.abs(t.amount))}
                    </p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${sm.cls}`}>
                      {sm.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pop-up de cajeros */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="card w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Cargar ${selected.toLocaleString('es-ES')} ARS</h3>
                <p className="mt-1 text-sm text-muted">Contactá a un cajero por WhatsApp para coordinar el pago.</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {CASHIERS.map((c) => (
                <a
                  key={c.phone}
                  href={waLink(c.phone, username, selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-panel2 p-4 transition hover:border-brand/50 hover:bg-brand/5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{c.role}: {c.name}</p>
                    <p className="truncate text-xs text-muted">{c.display}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-black">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.05-.96.23-3.23-.67-2.73-1.08-4.46-3.86-4.6-4.04-.13-.18-1.1-1.47-1.1-2.8 0-1.32.7-1.97.95-2.24.24-.27.53-.34.71-.34l.5.01c.16.01.38-.06.6.46.23.55.77 1.9.84 2.04.07.14.11.3.02.48-.09.18-.13.3-.27.46-.13.16-.28.36-.4.48-.13.13-.27.28-.12.54.16.27.7 1.15 1.5 1.86 1.04.93 1.91 1.21 2.18 1.35.27.13.42.11.58-.07.16-.18.67-.78.85-1.05.18-.27.36-.22.6-.13.24.09 1.55.73 1.81.86.27.13.45.2.51.31.07.11.07.64-.17 1.32Z"/></svg>
                    Cargar por WhatsApp
                  </span>
                </a>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-muted">
              El mensaje ya incluye tu usuario (<b className="text-white">{username}</b>) y el monto.
            </p>
          </div>
        </div>
      )}
    </AccountLayout>
  )
}
