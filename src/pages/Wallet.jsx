import AccountLayout, { fmt } from '../components/AccountLayout.jsx'
import { user } from '../data/account.js'
import { useWallet } from '../context/WalletContext.jsx'

// Links de pago estáticos de Mercado Pago (montos fijos en ARS).
const MP_LINKS = [
  { amount: 2000, url: 'https://mpago.la/1c58wLG' },
  { amount: 5000, url: 'https://mpago.la/1UCdtN5' },
  { amount: 10000, url: 'https://mpago.la/2MkcCnt' },
  { amount: 20000, url: 'https://mpago.la/1v2i8yn' },
]

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
        {/* Recargar saldo (Mercado Pago) */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-white">Recargar saldo</h2>
          <p className="mt-1 text-sm text-muted">Paga con Mercado Pago y el administrador acreditará tu saldo.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {MP_LINKS.map((l) => (
              <a
                key={l.amount}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-panel2 p-4 transition hover:border-brand/50 hover:bg-brand/5"
              >
                <span className="text-2xl">💳</span>
                <span className="font-display text-lg font-extrabold text-white">${l.amount.toLocaleString('es-ES')}</span>
                <span className="text-[11px] text-muted">ARS · Pagar</span>
              </a>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-panel2 p-3 text-xs text-muted">
            Tras pagar, avisa al administrador con <b className="text-white">tu nombre</b> y el monto.
            Él confirmará el pago y cargará tu saldo. Los retiros también se gestionan con el administrador.
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
    </AccountLayout>
  )
}
