function OddButton({ label, value }) {
  return (
    <button className="flex flex-1 flex-col items-center rounded-xl bg-panel2 px-3 py-2 transition hover:bg-brand/15 hover:ring-1 hover:ring-brand/40">
      <span className="text-[10px] uppercase text-muted">{label}</span>
      <span className="font-display text-sm font-bold text-white">{value.toFixed(2)}</span>
    </button>
  )
}

export default function EventCard({ event }) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="chip">{event.league}</span>
        {event.live ? (
          <span className="flex items-center gap-1.5 font-semibold text-brand">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            EN VIVO · {event.minute}
          </span>
        ) : (
          <span className="text-muted">Hoy · {event.kickoff}</span>
        )}
      </div>

      <div className="mb-4 space-y-2">
        {[0, 1].map((side) => (
          <div key={side} className="flex items-center justify-between">
            <span className="font-medium text-slate-100">
              {side === 0 ? event.home : event.away}
            </span>
            {event.score && (
              <span className="font-display font-bold text-white">{event.score[side]}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <OddButton label="1" value={event.odds['1']} />
        {event.odds.X != null && <OddButton label="X" value={event.odds.X} />}
        <OddButton label="2" value={event.odds['2']} />
      </div>
    </div>
  )
}
