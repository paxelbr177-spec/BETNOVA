import { Link } from 'react-router-dom'

export default function GameCard({ game }) {
  const [from, to] = game.cover
  return (
    <Link
      to={`/juego/${game.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/5 text-left shadow-card transition hover:-translate-y-1 hover:border-brand/40"
    >
      <div
        className="relative aspect-[3/4] w-full"
        style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
      >
        {game.thumb && (
          <img
            src={game.thumb}
            alt={game.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <div className="relative z-10 flex h-full flex-col justify-between p-3">
          <div className="flex items-center justify-between">
            {game.hot && (
              <span className="rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                🔥 Hot
              </span>
            )}
            <span className="ml-auto rounded-full bg-ink/60 px-2 py-0.5 text-[10px] font-medium text-white/80">
              RTP {game.rtp}%
            </span>
          </div>
          <div className="translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            <span className="btn-primary w-full text-sm">Jugar</span>
          </div>
        </div>
      </div>
      <div className="bg-panel p-3">
        <p className="truncate font-display text-sm font-semibold text-white">{game.name}</p>
        <div className="mt-1 flex items-center justify-between text-xs text-muted">
          <span>{game.provider}</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {game.players}
          </span>
        </div>
      </div>
    </Link>
  )
}
