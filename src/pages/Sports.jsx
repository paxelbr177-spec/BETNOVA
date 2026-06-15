import { Link } from 'react-router-dom'

export default function Sports() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold text-white">Deportes</h1>
      <div className="card mt-6 grid place-items-center p-16 text-center">
        <p className="text-5xl">⚽</p>
        <span className="chip mt-4 border border-gold/30 text-gold">Próximamente</span>
        <p className="mt-4 max-w-md font-display text-xl font-bold text-white">
          Apuestas deportivas en camino
        </p>
        <p className="mt-2 max-w-md text-sm text-muted">
          Estamos preparando las apuestas deportivas con cuotas en vivo. Por ahora,
          disfrutá del casino.
        </p>
        <Link to="/casino" className="btn-primary mt-6 text-sm">Ir al casino</Link>
      </div>
    </div>
  )
}
