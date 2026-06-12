import { useMemo, useState } from 'react'
import EventCard from '../components/EventCard.jsx'
import { events, sportsTabs } from '../data/sports.js'

export default function Sports() {
  const [tab, setTab] = useState('football')
  const [onlyLive, setOnlyLive] = useState(false)

  const list = useMemo(
    () => events.filter((e) => e.sport === tab && (!onlyLive || e.live)),
    [tab, onlyLive],
  )

  const liveCount = events.filter((e) => e.live).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Deportes</h1>
          <p className="mt-2 text-muted">
            <span className="font-semibold text-brand">{liveCount} eventos</span> en vivo ahora mismo.
          </p>
        </div>
        <button
          onClick={() => setOnlyLive((v) => !v)}
          className={`btn text-sm ${onlyLive ? 'bg-brand text-ink shadow-glow' : 'btn-ghost'}`}
        >
          <span className={`h-2 w-2 rounded-full ${onlyLive ? 'bg-ink' : 'bg-brand'}`} />
          Solo en vivo
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {sportsTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t.id ? 'bg-panel2 text-brand' : 'text-slate-300 hover:bg-panel'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="card grid place-items-center p-16 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 font-display font-semibold text-white">No hay eventos</p>
          <p className="text-sm text-muted">Cambia de deporte o desactiva el filtro “en vivo”.</p>
        </div>
      )}
    </div>
  )
}
