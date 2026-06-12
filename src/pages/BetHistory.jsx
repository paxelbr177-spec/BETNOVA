import { useMemo, useState } from 'react'
import AccountLayout, { fmt } from '../components/AccountLayout.jsx'
import { useWallet } from '../context/WalletContext.jsx'

const statusMeta = {
  won: { label: 'Ganada', cls: 'bg-brand/15 text-brand' },
  lost: { label: 'Perdida', cls: 'bg-red-500/15 text-red-400' },
  open: { label: 'Abierta', cls: 'bg-gold/15 text-gold' },
}

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'open', label: 'Abiertas' },
  { id: 'won', label: 'Ganadas' },
  { id: 'lost', label: 'Perdidas' },
]

export default function BetHistory() {
  const { bets } = useWallet()
  const [f, setF] = useState('all')

  const list = useMemo(
    () => (f === 'all' ? bets : bets.filter((b) => b.status === f)),
    [f, bets],
  )

  const staked = bets.reduce((s, b) => s + b.stake, 0)
  const returned = bets.reduce((s, b) => s + (b.payout || 0), 0)
  const net = returned - staked

  return (
    <AccountLayout title="Mis apuestas">
      {/* Resumen */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs text-muted">Total apostado</p>
          <p className="mt-1 font-display text-xl font-extrabold text-white">${fmt(staked)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted">Retornado</p>
          <p className="mt-1 font-display text-xl font-extrabold text-brand">${fmt(returned)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted">Resultado neto</p>
          <p className={`mt-1 font-display text-xl font-extrabold ${net >= 0 ? 'text-brand' : 'text-red-400'}`}>
            {net >= 0 ? '+' : '-'}${fmt(Math.abs(net))}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((it) => (
          <button
            key={it.id}
            onClick={() => setF(it.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              f === it.id ? 'bg-brand text-ink shadow-glow' : 'bg-panel text-slate-300 hover:bg-panel2'
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {list.map((b) => {
          const sm = statusMeta[b.status]
          return (
            <div key={b.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-panel2 text-lg">
                  {b.kind === 'sport' ? '⚽' : '🎰'}
                </span>
                <div>
                  <p className="font-medium text-white">{b.event}</p>
                  <p className="text-sm text-muted">{b.pick} · cuota {b.odds.toFixed(2)}</p>
                  <p className="text-xs text-muted">{b.date}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 sm:justify-end">
                <div className="text-right">
                  <p className="text-xs text-muted">Apostado</p>
                  <p className="font-display font-bold text-white">${fmt(b.stake)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Retorno</p>
                  <p className={`font-display font-bold ${b.payout ? 'text-brand' : 'text-slate-400'}`}>
                    {b.payout != null ? `$${fmt(b.payout)}` : '—'}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sm.cls}`}>
                  {sm.label}
                </span>
              </div>
            </div>
          )
        })}
        {list.length === 0 && (
          <div className="card grid place-items-center p-12 text-center">
            <p className="text-3xl">🎟️</p>
            <p className="mt-2 text-muted">No hay apuestas en esta categoría.</p>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
