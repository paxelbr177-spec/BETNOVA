import { useMemo, useState } from 'react'
import GameCard from '../components/GameCard.jsx'
import { games, categories } from '../data/games.js'

export default function Casino() {
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const okCat = active === 'all' || g.category === active
      const okQuery =
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.provider.toLowerCase().includes(query.toLowerCase())
      return okCat && okQuery
    })
  }, [active, query])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-white">Casino</h1>
        <p className="mt-2 text-muted">Explora {games.length} juegos de ejemplo. Filtra por categoría o busca por nombre.</p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                active === c.id
                  ? 'bg-brand text-ink shadow-glow'
                  : 'bg-panel text-slate-300 hover:bg-panel2'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar juego o proveedor…"
            className="input pl-10"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {filtered.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      ) : (
        <div className="card grid place-items-center p-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-display font-semibold text-white">Sin resultados</p>
          <p className="text-sm text-muted">Prueba con otro término o categoría.</p>
        </div>
      )}
    </div>
  )
}
