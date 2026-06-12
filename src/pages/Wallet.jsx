import { useState } from 'react'
import AccountLayout, { fmt } from '../components/AccountLayout.jsx'
import { user, paymentMethods } from '../data/account.js'
import { useWallet } from '../context/WalletContext.jsx'

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
  const { balance, bonus, transactions, deposit, withdraw } = useWallet()
  const [mode, setMode] = useState('deposit')
  const [method, setMethod] = useState('pix')
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const quick = [25, 50, 100, 250]

  const submit = async (e) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val <= 0) { setMsg({ ok: false, text: 'Introduce un importe válido.' }); return }
    if (mode === 'withdraw' && val > balance) {
      setMsg({ ok: false, text: 'Importe superior a tu saldo disponible.' }); return
    }
    setBusy(true)
    const fn = mode === 'deposit' ? deposit : withdraw
    const { error } = await fn(val, method === 'pix' ? 'Pix' : method === 'card' ? 'Tarjeta' : method === 'usdt' ? 'USDT' : 'Skrill')
    setBusy(false)
    if (error) { setMsg({ ok: false, text: error }); return }
    setMsg({
      ok: true,
      text: mode === 'deposit'
        ? `Depósito de $${fmt(val)} acreditado.`
        : `Retiro de $${fmt(val)} solicitado. Procesando…`,
    })
    setAmount('')
  }

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
        {/* Depósito / Retiro */}
        <div className="card p-6">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-panel2 p-1">
            {['deposit', 'withdraw'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setMsg(null) }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  mode === m ? 'bg-brand text-ink' : 'text-slate-300'
                }`}
              >
                {m === 'deposit' ? 'Depositar' : 'Retirar'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Método</label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setMethod(p.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      method === p.id
                        ? 'border-brand/60 bg-brand/10 text-white'
                        : 'border-white/10 bg-panel2 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span>
                      <span className="block font-medium">{p.label}</span>
                      <span className="block text-[11px] text-muted">{p.note}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Importe ({user.currency})</label>
              <input
                className="input"
                inputMode="decimal"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setMsg(null) }}
                placeholder="0.00"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {quick.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className="rounded-lg bg-panel2 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
                  >
                    +${q}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? 'Procesando…' : mode === 'deposit' ? 'Depositar ahora' : 'Solicitar retiro'}
            </button>

            {msg && (
              <p className={`rounded-xl p-3 text-center text-sm ${
                msg.ok ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-400'
              }`}>
                {msg.text}
              </p>
            )}
          </form>
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
    </AccountLayout>
  )
}
