import { useEffect, useState } from 'react'

// Cartelitos de "prueba social": actividad simulada (registros, premios, cargas).
const NAMES = [
  'Mariana', 'José', 'Lucía', 'Mateo', 'Sofía', 'Tomás', 'Valentina', 'Lautaro',
  'Camila', 'Benjamín', 'Julieta', 'Agustín', 'Martina', 'Nicolás', 'Rocío', 'Franco',
  'Catalina', 'Bruno', 'Florencia', 'Thiago', 'Carla', 'Ramiro', 'Brenda', 'Iván',
  'Pilar', 'Gonzalo', 'Abril', 'Santino', 'Delfina', 'Joaquín',
]
const GAMES = [
  'Nova Crash', 'Nova Fortune', 'Nova Roulette', 'Nova Mines', 'Nova Plinko', 'Nova Dice',
  'Nova Joker', 'Nova Limbo', 'Nova Wheel', 'Nova Keno', 'Nova Coinflip', 'Nova Blackjack',
]
const AMOUNTS = [1500, 2500, 5000, 7500, 10000, 12500, 18000, 25000, 32000, 50000, 75000]

const fmt = (n) => n.toLocaleString('es-ES')
const pick = (a) => a[Math.floor(Math.random() * a.length)]

function makeMsg() {
  const name = pick(NAMES)
  const r = Math.random()
  if (r < 0.4) {
    return { icon: '🎉', node: <><b className="text-white">{name}</b> se registró</> }
  }
  if (r < 0.82) {
    return { icon: '💰', node: <><b className="text-white">{name}</b> ganó <b className="text-gold">${fmt(pick(AMOUNTS))}</b> en {pick(GAMES)}</> }
  }
  return { icon: '⚡', node: <><b className="text-white">{name}</b> cargó <b className="text-brand">${fmt(pick(AMOUNTS))}</b></> }
}

export default function ActivityToasts() {
  const [msg, setMsg] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let hideTimer, nextTimer
    const run = () => {
      setMsg(makeMsg())
      setShow(true)
      hideTimer = setTimeout(() => {
        setShow(false)
        nextTimer = setTimeout(run, 3500 + Math.random() * 4500) // pausa 3.5-8s
      }, 5000) // visible 5s
    }
    const start = setTimeout(run, 3500) // primer cartel a los 3.5s
    return () => { clearTimeout(start); clearTimeout(hideTimer); clearTimeout(nextTimer) }
  }, [])

  if (!msg) return null
  return (
    <div
      className={`pointer-events-none fixed bottom-4 left-4 z-50 max-w-[calc(100vw-2rem)] transition-all duration-500 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-panel/95 px-4 py-3 shadow-card backdrop-blur">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/15 text-lg">{msg.icon}</span>
        <div className="text-sm text-slate-200">{msg.node}</div>
        <span className="ml-1 flex items-center gap-1 text-[10px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> ahora
        </span>
      </div>
    </div>
  )
}
