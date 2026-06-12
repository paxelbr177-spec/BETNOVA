import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Loader de juegos HTML5 self-hosted vía <iframe>.
 *
 * Modelo: el juego vive en /public/games/<carpeta>/index.html y se referencia
 * desde src/data/games.js en el campo `embed`. Este componente solo lo incrusta;
 * no descarga ni aloja juegos por su cuenta.
 *
 * Para integrar un juego real:
 *   1. Copia un juego HTML5 (open-source, licencia MIT/Apache) a
 *      public/games/mi-juego/  (con su index.html).
 *   2. En src/data/games.js, pon  embed: '/games/mi-juego/index.html'
 *   3. Listo: aparecerá aquí al pulsar "Jugar".
 */
export default function GameFrame({ game }) {
  const [launched, setLaunched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0) // fuerza recarga del iframe
  const wrapRef = useRef(null)
  const iframeRef = useRef(null)
  const [from, to] = game.cover

  const { user } = useAuth()
  const { balance, placeBet, addWin } = useWallet()
  // El listener de mensajes vive durante todo el render; usamos refs para leer
  // siempre el saldo/funciones más recientes sin re-suscribir.
  const balanceRef = useRef(balance)
  balanceRef.current = balance
  const actionsRef = useRef({ placeBet, addWin, user })
  actionsRef.current = { placeBet, addWin, user }

  // Puente con el juego (iframe): el juego pide saldo y reporta apuestas/premios;
  // la app los aplica a la billetera REAL y devuelve el saldo confirmado.
  useEffect(() => {
    function onMessage(e) {
      const iframe = iframeRef.current
      if (!iframe || e.source !== iframe.contentWindow) return
      const d = e.data
      if (!d || typeof d !== 'object') return
      const { placeBet, addWin, user } = actionsRef.current
      const reply = (bal) => iframe.contentWindow.postMessage({ type: 'BETNOVA_BALANCE', balance: bal }, '*')
      if (!user) return // invitado: el juego corre en modo demo local (no toca la billetera real)
      if (d.type === 'BETNOVA_READY') {
        iframe.contentWindow.postMessage({ type: 'BETNOVA_INIT', balance: balanceRef.current }, '*')
      } else if (d.type === 'BETNOVA_BET') {
        placeBet(d.amount).then((r) => reply(r.balance ?? balanceRef.current))
      } else if (d.type === 'BETNOVA_WIN') {
        addWin(d.amount).then((r) => reply(r.balance ?? balanceRef.current))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const reload = () => { setLoading(true); setKey((k) => k + 1) }

  const fullscreen = () => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  return (
    <div
      ref={wrapRef}
      className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-card"
      style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
    >
      <span className="absolute left-4 top-4 z-20 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white">
        Modo demo
      </span>

      {/* Estado 1: portada con botón de lanzar */}
      {!launched && (
        <button
          onClick={() => { setLaunched(true); setLoading(true) }}
          className="group absolute inset-0 z-10 grid place-items-center"
          aria-label={`Jugar ${game.name}`}
        >
          <span className="grid h-20 w-20 place-items-center rounded-full bg-ink/70 text-white transition group-hover:scale-110 group-hover:bg-ink/85">
            <svg viewBox="0 0 24 24" className="h-9 w-9 translate-x-0.5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      {/* Estado 2a: hay juego self-hosted -> iframe */}
      {launched && game.embed && (
        <>
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-ink/60">
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
                <p className="font-display font-semibold text-white">Cargando {game.name}…</p>
              </div>
            </div>
          )}
          <iframe
            key={key}
            ref={iframeRef}
            src={game.embed}
            title={game.name}
            className="absolute inset-0 h-full w-full border-0"
            onLoad={() => setLoading(false)}
            allow="autoplay; fullscreen"
            // sandbox: el juego self-hosted corre aislado pero con scripts.
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
          {/* Barra de controles */}
          <div className="absolute right-3 top-3 z-20 flex gap-2">
            <button onClick={reload} className="grid h-9 w-9 place-items-center rounded-lg bg-ink/70 text-white hover:bg-ink" aria-label="Recargar">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v4h-4" />
              </svg>
            </button>
            <button onClick={fullscreen} className="grid h-9 w-9 place-items-center rounded-lg bg-ink/70 text-white hover:bg-ink" aria-label="Pantalla completa">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Estado 2b: lanzado pero sin juego cargado -> placeholder */}
      {launched && !game.embed && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-ink/75 p-6 text-center">
          <div className="max-w-sm">
            <p className="text-4xl">🔜</p>
            <p className="mt-3 font-display text-lg font-bold text-white">
              Próximamente
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Este juego estará disponible muy pronto. Mientras tanto, prueba
              nuestros juegos destacados.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => setLaunched(false)} className="btn-ghost text-sm">Volver</button>
              <Link to="/casino" className="btn-primary text-sm">Ver juegos</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
