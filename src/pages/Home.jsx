import { Link } from 'react-router-dom'
import GameCard from '../components/GameCard.jsx'
import EventCard from '../components/EventCard.jsx'
import { games, jackpots } from '../data/games.js'
import { events } from '../data/sports.js'
import { useAuth } from '../context/AuthContext.jsx'

const heroBg = `${import.meta.env.BASE_URL}mundial-hero.svg`

const fmt = (n) => n.toLocaleString('es-ES')

function Marquee() {
  const items = [
    '🎉 Bono de bienvenida 100% hasta $500',
    '⚡ Retiros en minutos vía Pix',
    '🏆 Cashback semanal del 10%',
    '🎰 +2.000 juegos disponibles',
    '🔒 Juego seguro y verificado',
  ]
  const loop = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-white/5 bg-panel py-2.5">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-sm text-muted">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center gap-2">{t}</span>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const featured = games.slice(0, 12)
  const liveEvents = events.filter((e) => e.live).slice(0, 3)
  const { user } = useAuth()

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-grid">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="chip mb-5 border border-brand/30 text-brand">
              ✨ Nuevo · Bono de bienvenida
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Juega, apuesta y <span className="text-brand">gana</span> en un solo lugar
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Casino, juegos en vivo y apuestas deportivas con cuotas competitivas.
              Recibe <span className="font-semibold text-white">100% hasta $500</span> en tu primer depósito.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link to="/casino" className="btn-primary text-base">Ir al casino</Link>
              ) : (
                <Link to="/registro" className="btn-primary text-base">Crear cuenta gratis</Link>
              )}
              <Link to="/casino" className="btn-ghost text-base">Explorar casino</Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted">
              <div><span className="block font-display text-2xl font-bold text-white">2.000+</span> juegos</div>
              <div><span className="block font-display text-2xl font-bold text-white">24/7</span> soporte</div>
              <div><span className="block font-display text-2xl font-bold text-white">~3 min</span> retiros</div>
            </div>
          </div>

          {/* Jackpot card */}
          <div className="relative">
            <div className="animate-floaty card mx-auto max-w-sm p-6">
              <div className="flex items-center justify-between">
                <span className="chip text-gold">🏆 Jackpots en vivo</span>
                <span className="text-xs text-brand">● en directo</span>
              </div>
              <div className="mt-5 space-y-4">
                {jackpots.map((j) => (
                  <div key={j.name} className="rounded-xl bg-panel2 p-4">
                    <p className="text-xs text-muted">{j.name}</p>
                    <p className="font-display text-2xl font-extrabold text-gold">
                      ${fmt(j.amount)}
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/casino" className="btn-primary mt-5 w-full">Probar suerte</Link>
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* Categorías rápidas */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { t: 'Slots', d: '+1.200 títulos', e: '🎰', to: '/casino' },
            { t: 'Casino en vivo', d: 'Dealers reales', e: '🃏', to: '/casino' },
            { t: 'Deportes', d: 'Cuotas en vivo', e: '⚽', to: '/deportes' },
            { t: 'Crash', d: 'Multiplicadores', e: '🚀', to: '/casino' },
          ].map((c) => (
            <Link
              key={c.t}
              to={c.to}
              className="card group flex flex-col gap-2 p-5 transition hover:-translate-y-1 hover:border-brand/40"
            >
              <span className="text-3xl">{c.e}</span>
              <span className="font-display font-bold text-white">{c.t}</span>
              <span className="text-sm text-muted">{c.d}</span>
              <span className="mt-2 text-sm text-brand opacity-0 transition group-hover:opacity-100">
                Ver más →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Juegos destacados */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">🔥 Juegos destacados</h2>
          <Link to="/casino" className="text-sm font-semibold text-brand hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      {/* Apuestas en vivo */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">⚡ Apuestas en vivo</h2>
          <Link to="/deportes" className="text-sm font-semibold text-brand hover:underline">
            Ver deportes
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {liveEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* CTA final (solo para visitantes sin sesión) */}
      {!user && (
        <section className="mx-auto max-w-7xl px-4 pb-4">
          <div className="card relative overflow-hidden bg-hero-grid p-8 text-center md:p-14">
            <h3 className="font-display text-3xl font-extrabold text-white md:text-4xl">
              ¿Listo para empezar?
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Crea tu cuenta en menos de un minuto y reclama tu bono de bienvenida.
            </p>
            <Link to="/registro" className="btn-primary mt-6 text-base">Registrarme ahora</Link>
          </div>
        </section>
      )}
    </>
  )
}
