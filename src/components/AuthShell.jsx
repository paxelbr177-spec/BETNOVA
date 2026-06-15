import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

const perks = [
  '🎁 Bono de bienvenida 100% hasta $500',
  '⚡ Depósitos y retiros instantáneos',
  '🔒 Plataforma segura y verificada',
  '🎰 +2.000 juegos y apuestas en vivo',
]

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-stretch gap-0 px-4 py-10 md:grid-cols-2 md:gap-10">
      {/* Panel informativo */}
      <div className="hidden flex-col justify-between rounded-3xl bg-hero-grid p-10 md:flex">
        <Logo className="text-2xl" />
        <div>
          <h2 className="font-display text-3xl font-extrabold leading-tight text-white">
            Tu juego empieza aquí
          </h2>
          <ul className="mt-6 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-slate-200">{p}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted">+18 · Juega con responsabilidad.</p>
      </div>

      {/* Formulario */}
      <div className="flex items-center">
        <div className="card mx-auto w-full max-w-md p-7 md:p-9">
          <div className="mb-6 md:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </div>
      </div>
    </div>
  )
}

export { Link }
