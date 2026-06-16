import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'
import { supabase, hasSupabase } from '../lib/supabase.js'
import { transactions as seedTx, bets as seedBets } from '../data/account.js'

const WalletContext = createContext(null)
export const useWallet = () => useContext(WalletContext)

const DEFAULT_BALANCE = 1000
const DEFAULT_BONUS = 120

const pad = (n) => String(n).padStart(2, '0')
function nowStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
// Mapea filas de Supabase (snake_case + created_at) a lo que esperan las páginas.
const mapTx = (t) => ({ id: t.id, type: t.type, method: t.method, amount: Number(t.amount), status: t.status, date: (t.created_at || '').slice(0, 16).replace('T', ' ') })
const mapBet = (b) => ({ id: b.id, kind: b.kind, event: b.event, pick: b.pick, odds: Number(b.odds), stake: Number(b.stake), payout: b.payout == null ? null : Number(b.payout), status: b.status, date: (b.created_at || '').slice(0, 16).replace('T', ' ') })

export function WalletProvider({ children }) {
  const { user } = useAuth()
  const [state, setState] = useState({ balance: 0, bonus: 0, transactions: [], bets: [], isAdmin: false, isAgent: false, loading: true })

  const localKey = user ? `betnova_wallet_${user.email}` : null

  const loadLocal = useCallback(() => {
    const raw = localStorage.getItem(localKey)
    if (raw) return JSON.parse(raw)
    // Semilla para un usuario local nuevo (para que las páginas no estén vacías).
    const seeded = {
      balance: DEFAULT_BALANCE,
      bonus: DEFAULT_BONUS,
      transactions: seedTx.slice().reverse().map((t, i) => ({ ...t, id: 'seed-t' + i })),
      bets: seedBets.map((b, i) => ({ ...b, id: 'seed-b' + i })),
    }
    localStorage.setItem(localKey, JSON.stringify(seeded))
    return seeded
  }, [localKey])

  const load = useCallback(async () => {
    if (!user) {
      setState({ balance: 0, bonus: 0, transactions: [], bets: [], isAdmin: false, isAgent: false, loading: false })
      return
    }
    if (hasSupabase) {
      setState((s) => ({ ...s, loading: true }))
      // IMPORTANTE: filtrar por el id del usuario. Si es admin, las políticas le dejan
      // ver TODOS los perfiles/transacciones, así que sin el filtro .single() recibiría
      // muchas filas y fallaría. Con .eq('id'/'user_id', uid) siempre es su propia fila.
      const { data: au } = await supabase.auth.getUser()
      const uid = au?.user?.id
      const [{ data: profile }, { data: txs }, { data: bets }] = await Promise.all([
        // select('*') es tolerante: si una columna (p. ej. is_agent) aún no existe en la BD, no rompe.
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
        supabase.from('bets').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
      ])
      setState({
        balance: Number(profile?.balance ?? DEFAULT_BALANCE),
        bonus: Number(profile?.bonus ?? 0),
        transactions: (txs || []).map(mapTx),
        bets: (bets || []).map(mapBet),
        isAdmin: Boolean(profile?.is_admin),
        isAgent: Boolean(profile?.is_agent),
        loading: false,
      })
    } else {
      const d = loadLocal()
      setState({ ...d, isAdmin: false, isAgent: false, loading: false })
    }
  }, [user, loadLocal])

  useEffect(() => { load() }, [load])

  // amount con signo: + entra (depósito/premio), - sale (retiro/apuesta)
  async function apply(type, method, amount) {
    if (hasSupabase) {
      const { data, error } = await supabase.rpc('wallet_apply', { p_type: type, p_method: method, p_amount: amount })
      if (error) return { error: error.message }
      const nb = Number(data)
      // Actualiza el estado en sitio (sin recargar) para que cada jugada sea rápida.
      setState((s) => ({
        ...s,
        balance: nb,
        transactions: [{ id: 't' + Date.now(), type, method, amount, status: 'ok', date: nowStr() }, ...s.transactions].slice(0, 50),
      }))
      return { balance: nb }
    }
    const d = loadLocal()
    const next = d.balance + amount
    if (next < 0) return { error: 'Saldo insuficiente.' }
    d.balance = next
    d.transactions = [
      { id: 't' + Date.now(), type, method, amount, status: type === 'withdraw' ? 'pending' : 'ok', date: nowStr() },
      ...d.transactions,
    ]
    localStorage.setItem(localKey, JSON.stringify(d))
    setState((s) => ({ ...s, balance: d.balance, transactions: d.transactions }))
    return { balance: next }
  }

  const deposit = (amount, method) => apply('deposit', method, Math.abs(amount))
  const withdraw = (amount, method) => apply('withdraw', method, -Math.abs(amount))
  // Operaciones que usan los juegos (vía el puente de GameFrame).
  const placeBet = (amount) => apply('bet', 'Juego', -Math.abs(amount))
  const addWin = (amount) => apply('win', 'Juego', Math.abs(amount))

  return (
    <WalletContext.Provider value={{ ...state, deposit, withdraw, placeBet, addWin, refresh: load, isMock: !hasSupabase }}>
      {children}
    </WalletContext.Provider>
  )
}
