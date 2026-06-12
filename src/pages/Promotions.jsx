import { Link } from 'react-router-dom'

const promos = [
  {
    tag: 'Bienvenida', color: 'from-brand/30 to-brand/5',
    title: 'Bono 100% hasta $500',
    desc: 'Duplica tu primer depósito y empieza con el doble de saldo para jugar.',
    cta: 'Reclamar',
  },
  {
    tag: 'Cashback', color: 'from-gold/30 to-gold/5',
    title: '10% de cashback semanal',
    desc: 'Recupera parte de lo jugado cada lunes, sin importar el resultado.',
    cta: 'Activar',
  },
  {
    tag: 'Deportes', color: 'from-blue-500/30 to-blue-500/5',
    title: 'Apuesta gratis de $20',
    desc: 'Coloca tu primera apuesta combinada y recibe una free bet de regalo.',
    cta: 'Quiero mi free bet',
  },
  {
    tag: 'Referidos', color: 'from-pink-500/30 to-pink-500/5',
    title: 'Invita y gana $25',
    desc: 'Por cada amigo que se registre y deposite, ambos reciben un bono.',
    cta: 'Invitar amigos',
  },
]

const steps = [
  { n: '1', t: 'Crea tu cuenta', d: 'Regístrate en menos de un minuto.' },
  { n: '2', t: 'Haz tu depósito', d: 'Métodos rápidos y seguros, incluido Pix.' },
  { n: '3', t: 'Reclama tu bono', d: 'El bono se activa automáticamente al depositar.' },
]

export default function Promotions() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-white">Promociones</h1>
        <p className="mt-2 text-muted">Bonos y beneficios de ejemplo. Aplican términos y condiciones (demo).</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {promos.map((p) => (
          <div key={p.title} className={`card relative overflow-hidden bg-gradient-to-br ${p.color} p-6`}>
            <span className="chip mb-4 text-white">{p.tag}</span>
            <h3 className="font-display text-2xl font-bold text-white">{p.title}</h3>
            <p className="mt-2 max-w-md text-muted">{p.desc}</p>
            <Link to="/registro" className="btn-primary mt-5 text-sm">{p.cta}</Link>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="mb-6 font-display text-2xl font-bold text-white">¿Cómo reclamar tu bono?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-display font-bold text-ink">
                {s.n}
              </span>
              <h4 className="mt-4 font-display font-bold text-white">{s.t}</h4>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-panel p-5 text-sm text-muted">
        <strong className="text-white">Juego responsable:</strong> los bonos están sujetos a
        requisitos de apuesta. Juega solo con lo que puedas permitirte. +18. Esta es una
        maqueta sin dinero real.
      </div>
    </div>
  )
}
