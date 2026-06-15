import Logo from './Logo.jsx'

const cols = [
  { title: 'Casino', items: ['Slots', 'Casino en vivo', 'Crash', 'Jackpots', 'Mesa'] },
  { title: 'Deportes', items: ['Fútbol', 'Basket', 'Tenis', 'eSports', 'En vivo'] },
  { title: 'Soporte', items: ['Centro de ayuda', 'Chat 24/7', 'Métodos de pago', 'Términos', 'Privacidad'] },
]

const pays = ['VISA', 'Mastercard', 'Pix', 'USDT', 'Skrill']

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-panel">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Casino online con juegos <span className="text-white">100% originales</span>,
            desarrollados por BetNova. Sin proveedores externos.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {pays.map((p) => (
              <span key={p} className="chip">{p}</span>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-3 font-display text-sm font-bold text-white">{c.title}</h4>
            <ul className="space-y-2 text-sm text-muted">
              {c.items.map((i) => (
                <li key={i}>
                  <a href="#" className="transition hover:text-brand">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted md:flex-row">
          <div className="flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-white/20 font-bold">18+</span>
            <span>Juega con responsabilidad. Solo para mayores de 18 años.</span>
          </div>
          <p>© {new Date().getFullYear()} BetNova. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
