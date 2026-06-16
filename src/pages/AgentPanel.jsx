import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext.jsx'
import { supabase, hasSupabase, createTempClient } from '../lib/supabase.js'
import { slugUsername, usernameToEmail } from '../lib/players.js'

const fmt = (n) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Stat({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold ${accent || 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function AgentPanel() {
  const { isAgent, loading, balance: float, refresh } = useWallet()
  const [uid, setUid] = useState(null)
  const [players, setPlayers] = useState([])
  const [txs, setTxs] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  // Form crear usuario
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  // Gestión de saldo por jugador
  const [openId, setOpenId] = useState(null)
  const [amount, setAmount] = useState('')

  const loadData = useCallback(async () => {
    if (!hasSupabase || !isAgent) { setDataLoading(false); return }
    const { data: au } = await supabase.auth.getUser()
    const id = au?.user?.id
    setUid(id)
    const { data: ps } = await supabase
      .from('profiles')
      .select('id,name,username,balance,created_at')
      .eq('created_by', id)
      .order('created_at', { ascending: true })
    const ids = (ps || []).map((p) => p.id)
    let movements = []
    if (ids.length) {
      const { data: t } = await supabase
        .from('transactions')
        .select('*')
        .in('user_id', ids)
        .order('created_at', { ascending: false })
        .limit(80)
      movements = t || []
    }
    setPlayers(ps || [])
    setTxs(movements)
    setDataLoading(false)
  }, [isAgent])

  useEffect(() => { if (!loading) loadData() }, [loading, loadData])

  if (loading || dataLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-brand" /></div>
  }
  if (!hasSupabase) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted">El panel de agente requiere Supabase configurado.</div>
  }
  if (!isAgent) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-white">Acceso restringido</h1>
        <p className="mt-2 text-muted">Esta sección es solo para agentes.</p>
        <Link to="/" className="btn-primary mt-6">Volver al inicio</Link>
      </div>
    )
  }

  const nameOf = Object.fromEntries(players.map((p) => [p.id, p.username || p.name || p.id.slice(0, 6)]))
  const playersBalance = players.reduce((s, p) => s + Number(p.balance || 0), 0)

  async function createPlayer(e) {
    e.preventDefault()
    setMsg(null)
    const uname = slugUsername(form.username)
    if (uname.length < 3) return setMsg({ ok: false, text: 'El usuario debe tener al menos 3 caracteres (letras/números).' })
    if (form.password.length < 6) return setMsg({ ok: false, text: 'La contraseña debe tener al menos 6 caracteres.' })
    setBusy(true)
    const email = usernameToEmail(uname)
    // 1) Crear la cuenta sin tocar la sesión del agente (cliente desechable).
    const temp = createTempClient()
    const { error: suErr } = await temp.auth.signUp({ email, password: form.password, options: { data: { name: form.name || uname } } })
    if (suErr) {
      setBusy(false)
      const m = suErr.message?.toLowerCase().includes('already') ? 'Ese usuario ya existe. Elegí otro.' : suErr.message
      return setMsg({ ok: false, text: m })
    }
    // 2) Vincular el jugador a este agente (created_by) + guardar usuario/nombre.
    const { error: linkErr } = await supabase.rpc('agent_create_player', { p_email: email, p_username: uname, p_name: form.name || uname })
    try { await temp.auth.signOut() } catch { /* noop */ }
    setBusy(false)
    if (linkErr) return setMsg({ ok: false, text: linkErr.message })
    setMsg({ ok: true, text: `✓ Usuario creado. Usuario: "${uname}" · Clave: "${form.password}". Pasáselos al familiar para que entre.` })
    setForm({ name: '', username: '', password: '' })
    loadData()
  }

  async function adjust(player, sign) {
    const v = parseFloat(amount)
    if (!v || v <= 0) return setMsg({ ok: false, text: 'Introducí un importe válido.' })
    setBusy(true)
    const { data: nb, error } = await supabase.rpc('agent_set_balance', { p_player: player.id, p_amount: sign * v })
    setBusy(false)
    if (error) return setMsg({ ok: false, text: error.message })
    setMsg({ ok: true, text: `${sign > 0 ? 'Cargaste' : 'Quitaste'} $${fmt(v)} a ${player.username || player.name}. Saldo del jugador: $${fmt(nb)}` })
    setOpenId(null); setAmount('')
    loadData(); refresh() // refresh actualiza TU saldo (float)
  }

  const typeLabel = { deposit: 'Carga', withdraw: 'Quita', bet: 'Apuesta', win: 'Premio' }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Panel de agente</h1>
          <p className="mt-1 text-muted">Creá usuarios y gestioná el saldo de tus jugadores.</p>
        </div>
        <button onClick={() => { loadData(); refresh() }} className="btn-ghost text-sm">↻ Actualizar</button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Tu saldo (para repartir)" value={`$${fmt(float)}`} accent="text-sky-300" />
        <Stat label="Tus jugadores" value={players.length} accent="text-brand" />
        <Stat label="Saldo de tus jugadores" value={`$${fmt(playersBalance)}`} accent="text-gold" />
      </div>

      {msg && (
        <p className={`mt-5 rounded-xl p-3 text-center text-sm ${msg.ok ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-400'}`}>{msg.text}</p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Crear usuario */}
        <div className="card h-fit p-6">
          <h2 className="mb-1 font-display text-lg font-bold text-white">Crear usuario</h2>
          <p className="mb-4 text-sm text-muted">Para un familiar que no sabe registrarse. Entrará con el usuario y la clave que pongas.</p>
          <form onSubmit={createPlayer} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Nombre (cómo lo verás)</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tía Marta" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Usuario (para entrar)</label>
              <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="tia_marta" />
              {form.username && <p className="mt-1 text-xs text-muted">Entrará como: <b className="text-slate-300">{slugUsername(form.username) || '—'}</b></p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Contraseña</label>
              <input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="mínimo 6 caracteres" />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? 'Creando…' : 'Crear usuario'}</button>
          </form>
        </div>

        {/* Jugadores */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-white">Tus jugadores</h2>
          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.id} className="rounded-xl bg-panel2 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{p.name || '—'}</p>
                    <p className="truncate text-xs text-muted">@{p.username || '—'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-brand">${fmt(p.balance)}</span>
                    <button onClick={() => { setOpenId(openId === p.id ? null : p.id); setAmount(''); setMsg(null) }} className="btn-ghost text-xs">Saldo</button>
                  </div>
                </div>
                {openId === p.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Importe" className="input w-32 py-2" />
                    <div className="flex gap-1">
                      {[1000, 2000, 5000, 10000].map((q) => (
                        <button key={q} onClick={() => setAmount(String(q))} className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10">{q / 1000}k</button>
                      ))}
                    </div>
                    <button disabled={busy} onClick={() => adjust(p, 1)} className="btn-primary text-sm disabled:opacity-60">+ Cargar</button>
                    <button disabled={busy} onClick={() => adjust(p, -1)} className="btn-ghost text-sm disabled:opacity-60">− Quitar</button>
                  </div>
                )}
              </div>
            ))}
            {!players.length && <p className="text-sm text-muted">Todavía no creaste ningún usuario.</p>}
          </div>
        </div>
      </div>

      {/* Movimientos de tus jugadores */}
      <div className="card mt-6 p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-white">Movimientos de tus jugadores</h2>
        <div className="-mx-2 max-h-[420px] divide-y divide-white/5 overflow-y-auto">
          {txs.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 px-2 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{typeLabel[t.type] || t.type} · <span className="text-muted">@{nameOf[t.user_id] || '—'}</span></p>
                <p className="text-[11px] text-muted">{(t.created_at || '').slice(0, 16).replace('T', ' ')}</p>
              </div>
              <span className={`font-display text-sm font-bold ${Number(t.amount) >= 0 ? 'text-brand' : 'text-slate-300'}`}>
                {Number(t.amount) >= 0 ? '+' : ''}${fmt(Math.abs(Number(t.amount)))}
              </span>
            </div>
          ))}
          {!txs.length && <p className="px-2 text-sm text-muted">Sin movimientos todavía.</p>}
        </div>
      </div>
    </div>
  )
}
