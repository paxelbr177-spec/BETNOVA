export default function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2 font-display font-extrabold ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-ink shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M6 19V5h7a4 4 0 0 1 1.1 7.85A4.2 4.2 0 0 1 13.5 19H6Zm3.4-8.4h3a1.3 1.3 0 0 0 0-2.6h-3v2.6Zm0 5.4h3.4a1.4 1.4 0 0 0 0-2.8H9.4V16Z" />
        </svg>
      </span>
      <span className="text-xl tracking-tight text-white">
        Bet<span className="text-brand">Nova</span>
      </span>
    </span>
  )
}
