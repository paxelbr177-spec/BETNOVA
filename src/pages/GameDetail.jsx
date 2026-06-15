import { useParams, Link } from 'react-router-dom'
import GameCard from '../components/GameCard.jsx'
import GameFrame from '../components/GameFrame.jsx'
import { games, getGame } from '../data/games.js'

export default function GameDetail() {
  const { id } = useParams()
  const game = getGame(id)

  if (!game) {
    return (
      <div className="mx-auto grid min-h-[50vh] max-w-7xl place-items-center px-4 text-center">
        <div>
          <p className="text-4xl">🎰</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-white">Juego no encontrado</h1>
          <Link to="/casino" className="btn-primary mt-5">Volver al casino</Link>
        </div>
      </div>
    )
  }

  const similar = games.filter((g) => g.category === game.category && g.id !== game.id).slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Migas */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-muted">
        <Link to="/" className="hover:text-brand">Inicio</Link> /
        <Link to="/casino" className="hover:text-brand">Casino</Link> /
        <span className="text-slate-300">{game.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Reproductor (loader de iframe) */}
        <div>
          <GameFrame game={game} />

          {/* Estado de integración */}
          <p className="mt-3 text-xs text-muted">
            🎮 Juego original desarrollado por BetNova — sin proveedores externos.
          </p>

          {/* Acciones */}
          <div className="mt-3 flex flex-wrap gap-3">
            <Link to="/registro" className="btn-ghost">Jugar con saldo real</Link>
            <button className="btn-ghost" aria-label="Favorito">☆ Favorito</button>
          </div>

          {/* Descripción */}
          <div className="card mt-6 p-6">
            <h2 className="font-display text-lg font-bold text-white">Sobre el juego</h2>
            <p className="mt-2 text-muted">
              {game.name} es un juego <span className="text-slate-200">100% original</span>,
              desarrollado por <span className="text-slate-200">BetNova</span> — sin
              proveedores externos. Disfruta de una experiencia fluida, con gráficos
              vibrantes y mecánicas propias.
            </p>
          </div>
        </div>

        {/* Panel de info */}
        <aside className="space-y-4">
          <div className="card p-6">
            <h1 className="font-display text-2xl font-extrabold text-white">{game.name}</h1>
            <p className="mt-1 text-muted">Desarrollado por {game.provider}</p>
            {game.hot && <span className="chip mt-3 text-gold">🔥 Popular</span>}

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">RTP</dt>
                <dd className="font-semibold text-white">{game.rtp}%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Categoría</dt>
                <dd className="font-semibold capitalize text-white">{game.category}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Jugando ahora</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {game.players}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Volatilidad</dt>
                <dd className="font-semibold text-white">Media</dd>
              </div>
            </dl>
          </div>

          <div className="card bg-hero-grid p-6 text-center">
            <p className="font-display text-lg font-bold text-white">¿Listo para ganar?</p>
            <p className="mt-1 text-sm text-muted">Crea tu cuenta y reclama tu bono.</p>
            <Link to="/registro" className="btn-primary mt-4 w-full">Registrarme</Link>
          </div>
        </aside>
      </div>

      {/* Similares */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-2xl font-bold text-white">Juegos similares</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {similar.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
