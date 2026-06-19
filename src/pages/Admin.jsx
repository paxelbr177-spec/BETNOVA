import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext.jsx'
import { supabase, hasSupabase } from '../lib/supabase.js'
import { createAccount } from '../lib/createAccount.js'
import { slugUsername } from '../lib/players.js'

const fmt = (n) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0)

function Stat({ label, value, accent, hint }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold ${accent || 'text-white'}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export default function Admin() {
  const { isAdmin, loading } = useWallet()
  const [data, setData] = useState({ users: [], txs: [], loading: true })
  const [openId, setOpenId] = useState(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  // Crear cuenta (administrador / agente / usuario)
  const [cForm, setCForm] = useState({ role: 'user', name: '', username: '', password: '' })
  const [cBusy, setCBusy] = useState(false)

  const loadData = useCallback(async () => {
    if (!hasSupabase || !isAdmin) { setData((d) => ({ ...d, loading: false })); return }
    const [{ data: users }, { data: txs }] = await Promise.all([
      supabase.from('profiles').select('id,name,email,balance,is_admin,created_at').order('created_at', { ascending: true }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    setData({ users: users || [], txs: txs || [], loading: false })
  }, [isAdmin])

  useEffect(() => { if (!loading) loadData() }, [loading, loadData])

  if (loading || data.loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-brand" /></div>
  }
  if (!hasSupabase) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted">El panel de administrador requiere Supabase configurado (variables en <code className="text-brand">.env</code>).</div>
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-white">Acceso restringido</h1>
        <p className="mt-2 text-muted">Esta sección es solo para administradores.</p>
        <Link to="/" className="btn-primary mt-6">Volver al inicio</Link>
      </div>
    )
  }

  const { users, txs } = data
  const nameOf = Object.fromEntries(users.map((u) => [u.id, u.name || u.email || u.id.slice(0, 6)]))
  const circulating = sum(users, (u) => Number(u.balance))
  const deposited = sum(txs.filter((t) => t.type === 'deposit'), (t) => Number(t.amount))
  const returned = sum(txs.filter((t) => t.type === 'withdraw'), (t) => Math.abs(Number(t.amount)))
  const wagered = sum(txs.filter((t) => t.type === 'bet'), (t) => Math.abs(Number(t.amount)))
  const wonByPlayers = sum(txs.filter((t) => t.type === 'win'), (t) => Number(t.amount))
  const houseResult = wagered - wonByPlayers

  async function adjust(user, sign) {
    const v = parseFloat(amount)
    if (!v || v <= 0) { setMsg({ ok: false, text: 'Introduce un importe válido.' }); return }
    setBusy(true)
    const { data: nb, error } = await supabase.rpc('admin_adjust_balance', {
      p_user: user.id, p_amount: sign * v,
      p_type: sign > 0 ? 'deposit' : 'withdraw',
      p_note: sign > 0 ? 'Carga admin' : 'Devolución admin',
    })
    setBusy(false)
    if (error) { setMsg({ ok: false, text: error.message }); return }
    setMsg({ ok: true, text: `${sign > 0 ? 'Cargado' : 'Devuelto'} $${fmt(v)} a ${user.name || user.email}. Nuevo saldo: $${fmt(nb)}` })
    setOpenId(null); setAmount(''); loadData()
  }

  async function createCuenta(e) {
    e.preventDefault()
    setMsg(null)
    setCBusy(true)
    const { error, username } = await createAccount(cForm)
    setCBusy(false)
    if (error) { setMsg({ ok: false, text: error }); return }
    const roleLabel = cForm.role === 'admin' ? 'Administrador' : cForm.role === 'agent' ? 'Agente' : 'Usuario'
    setMsg({ ok: true, text: `✓ ${roleLabel} creado. Usuario: "${username}" · Clave: "${cForm.password}". Pasáselos para que pueda entrar.` })
    setCForm({ role: 'user', name: '', username: '', password: '' })
    loadData()
  }

  const typeLabel = { deposit: 'Carga', withdraw: 'Devolución', bet: 'Apuesta', win: 'Premio' }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Panel de administrador</h1>
          <p className="mt-1 text-muted">Estadísticas de BetNova y gestión de saldos.</p>
        </div>
        <button onClick={loadData} className="btn-ghost text-sm">↻ Actualizar</button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Usuarios" value={users.length} accent="text-brand" />
        <Stat label="Saldo en circulación" value={`$${fmt(circulating)}`} accent="text-gold" />
        <Stat label="Total cargado" value={`$${fmt(deposited)}`} hint={`${txs.filter((t) => t.type === 'deposit').length} cargas`} />
        <Stat label="Total devuelto" value={`$${fmt(returned)}`} hint={`${txs.filter((t) => t.type === 'withdraw').length} devoluciones`} />
        <Stat label="Apostado (jugadas)" value={`$${fmt(wagered)}`} />
        <Stat label="Resultado casa" value={`${houseResult >= 0 ? '+' : '−'}$${fmt(Math.abs(houseResult))}`} accent={houseResult >= 0 ? 'text-brand' : 'text-red-400'} hint="apostado − ganado" />
      </div>

      {msg && (
        <p className={`mt-5 rounded-xl p-3 text-center text-sm ${msg.ok ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-400'}`}>{msg.text}</p>
      )}

      {/* Crear cuenta (administrador / agente / usuario) */}
      <div className="card mt-6 p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-white">Crear cuenta</h2>
        <p className="mb-4 text-sm text-muted">Creá un administrador, un agente o un usuario. Entrará con el usuario y la clave que pongas.</p>
        <form onSubmit={createCuenta} className="grid gap-3 md:grid-cols-[auto_1fr_1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-1 block text-xs text-muted">Tipo</label>
            <div className="flex gap-1">
              {[{ v: 'admin', l: 'Admin' }, { v: 'agent', l: 'Agente' }, { v: 'user', l: 'Usuario' }].map((o) => (
                <button
                  key={o.v} type="button" onClick={() => setCForm({ ...cForm, role: o.v })}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${cForm.role === o.v ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
                >{o.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Nombre</label>
            <input className="input py-2" value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} placeholder="Nombre" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Usuario</label>
            <input className="input py-2" value={cForm.username} onChange={(e) => setCForm({ ...cForm, username: e.target.value })} placeholder="ej. tio_juan" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Contraseña</label>
            <input className="input py-2" value={cForm.password} onChange={(e) => setCForm({ ...cForm, password: e.target.value })} placeholder="mín. 6" />
          </div>
          <button type="submit" disabled={cBusy} className="btn-primary text-sm disabled:opacity-60">{cBusy ? 'Creando…' : 'Crear'}</button>
        </form>
        {cForm.username && <p className="mt-2 text-xs text-muted">Entrará como: <b className="text-slate-300">{slugUsername(cForm.username) || '—'}</b></p>}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Usuarios */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-white">Usuarios</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="rounded-xl bg-panel2 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {u.name || '—'} {u.is_admin && <span className="ml-1 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">ADMIN</span>}
                    </p>
                    <p className="truncate text-xs text-muted">{u.email || u.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-brand">${fmt(u.balance)}</span>
                    <button onClick={() => { setOpenId(openId === u.id ? null : u.id); setAmount(''); setMsg(null) }} className="btn-ghost text-xs">Gestionar</button>
                  </div>
                </div>
                {openId === u.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                    <input
                      value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Importe"
                      className="input w-32 py-2"
                    />
                    <div className="flex gap-1">
                      {[2000, 5000, 10000, 20000].map((q) => (
                        <button key={q} onClick={() => setAmount(String(q))} className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10">{q / 1000}k</button>
                      ))}
                    </div>
                    <button disabled={busy} onClick={() => adjust(u, 1)} className="btn-primary text-sm disabled:opacity-60">+ Cargar</button>
                    <button disabled={busy} onClick={() => adjust(u, -1)} className="btn-ghost text-sm disabled:opacity-60">− Devolver</button>
                  </div>
                )}
              </div>
            ))}
            {!users.length && <p className="text-sm text-muted">No hay usuarios todavía.</p>}
          </div>
        </div>

        {/* Movimientos recientes */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-white">Movimientos recientes</h2>
          <div className="-mx-2 max-h-[480px] divide-y divide-white/5 overflow-y-auto">
            {txs.slice(0, 60).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 px-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{typeLabel[t.type] || t.type} · <span className="text-muted">{nameOf[t.user_id] || '—'}</span></p>
                  <p className="text-[11px] text-muted">{(t.created_at || '').slice(0, 16).replace('T', ' ')}</p>
                </div>
                <span className={`font-display text-sm font-bold ${Number(t.amount) >= 0 ? 'text-brand' : 'text-slate-300'}`}>
                  {Number(t.amount) >= 0 ? '+' : ''}${fmt(Math.abs(Number(t.amount)))}
                </span>
              </div>
            ))}
            {!txs.length && <p className="px-2 text-sm text-muted">Sin movimientos.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
