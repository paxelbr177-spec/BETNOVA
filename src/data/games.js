// Datos de ejemplo (mock) — marcas y juegos ficticios, contenido original.
export const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'slots', label: 'Slots' },
  { id: 'crash', label: 'Instantáneos' },
  { id: 'table', label: 'Mesa' },
]

// Paletas para generar "portadas" de juego con gradientes (sin imágenes externas).
const covers = [
  ['#19e57f', '#0a6b3d'],
  ['#ffc83d', '#a35e00'],
  ['#5b8cff', '#13235e'],
  ['#ff5b8c', '#5e1330'],
  ['#a45bff', '#2a135e'],
  ['#5bf0ff', '#134f5e'],
  ['#ff8c5b', '#5e2a13'],
  ['#c0ff5b', '#3d5e13'],
]

const names = [
  'Nova Fortune', 'Nova Blackjack', 'Nova Limbo', 'Nova Roulette', 'Nova Crash',
  'Nova Keno', 'Nova Wheel', 'Nova Joker', 'Nova Coinflip', 'Fruit Blast',
  'Cosmic Wild', 'Nova Mines', 'Nova Dice', 'Wolf Moon', 'Samba Heat',
  'Inferno 7s', 'Ocean Treasure', 'Royal Crown', 'Thunder Zeus', 'Nova Plinko',
  'Bull Run', 'Phoenix Fire', 'Jungle Jackpot', 'Viking Saga',
]

const catPool = ['slots', 'live', 'crash', 'table', 'jackpot', 'slots', 'slots', 'live']
const providers = ['NovaPlay', 'Spinhouse', 'Evergreen', 'PixelBet', 'Ace Studios']

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Juegos con un HTML5 self-hosted en /public/games/<carpeta>/index.html
// Todos son open-source con licencia verificada (ver public/games/CREDITS.md).
const embeds = {
  'nova-fortune': '/games/nova-reels/index.html',   // ★ slot original (Phaser 3, arte propio)
  'nova-joker': '/games/nova-joker/index.html',     // ★ slot original temática cartas/joker
  'nova-roulette': '/games/nova-roulette/index.html', // ★ ruleta europea (rueda ISC + mesa propia)
  'nova-crash': '/games/nova-crash/index.html',     // ★ crash original
  'nova-mines': '/games/nova-mines/index.html',     // ★ mines original
  'nova-plinko': '/games/nova-plinko/index.html',   // ★ plinko original
  'nova-dice': '/games/nova-dice/index.html',       // ★ dice original
  'nova-blackjack': '/games/nova-blackjack/index.html', // ★ blackjack original
  'nova-limbo': '/games/nova-limbo/index.html',     // ★ limbo original
  'nova-keno': '/games/nova-keno/index.html',       // ★ keno original
  'nova-wheel': '/games/nova-wheel/index.html',     // ★ wheel original
  'nova-coinflip': '/games/nova-coinflip/index.html', // ★ coinflip original
}

// Miniaturas (arte original 3:4) para las tarjetas de los juegos jugables.
const thumbs = {
  'nova-fortune': '/games/nova-reels/thumb.svg',
  'nova-joker': '/games/nova-joker/thumb.svg',
  'nova-roulette': '/games/nova-roulette/thumb.svg',
  'nova-crash': '/games/nova-crash/thumb.svg',
  'nova-mines': '/games/nova-mines/thumb.svg',
  'nova-plinko': '/games/nova-plinko/thumb.svg',
  'nova-dice': '/games/nova-dice/thumb.svg',
  'nova-blackjack': '/games/nova-blackjack/thumb.svg',
  'nova-limbo': '/games/nova-limbo/thumb.svg',
  'nova-keno': '/games/nova-keno/thumb.svg',
  'nova-wheel': '/games/nova-wheel/thumb.svg',
  'nova-coinflip': '/games/nova-coinflip/thumb.svg',
}

// Categoría real de cada juego jugable (los tabs son: slots / crash / table).
const cats = {
  'nova-fortune': 'slots',
  'nova-joker': 'slots',
  'nova-roulette': 'table',
  'nova-crash': 'crash',
  'nova-mines': 'crash',
  'nova-plinko': 'crash',
  'nova-dice': 'crash',
  'nova-blackjack': 'table',
  'nova-limbo': 'crash',
  'nova-keno': 'crash',
  'nova-wheel': 'crash',
  'nova-coinflip': 'crash',
}

// Prefijo de la app (ej. "/BETNOVA" en GitHub Pages, "" en dev). Los embeds/thumbs
// usan rutas absolutas, así que hay que anteponer la base para que carguen.
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export const games = names
  .map((name, i) => {
    const slug = slugify(name)
    return {
      id: i + 1,
      name,
      slug,
      category: cats[slug] || catPool[i % catPool.length],
      provider: providers[i % providers.length],
      cover: covers[i % covers.length],
      hot: i % 5 === 0,
      rtp: (94 + (i % 6)).toFixed(1),
      players: 50 + ((i * 37) % 950),
      embed: embeds[slug] ? base + embeds[slug] : null,
      thumb: thumbs[slug] ? base + thumbs[slug] : null,
    }
  })
  // Catálogo recortado a juegos reales: solo los que tienen un juego cargado.
  .filter((g) => g.embed)

export const getGame = (id) => games.find((g) => String(g.id) === String(id))

export const jackpots = [
  { name: 'Mega Nova', amount: 1287430 },
  { name: 'Daily Drop', amount: 48210 },
  { name: 'Hourly Spark', amount: 3920 },
]
