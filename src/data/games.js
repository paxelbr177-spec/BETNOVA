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
  'Nova Keno', 'Nova Wheel', 'Nova Joker', 'Nova Coinflip', 'Nova Jackpot',
  'Nova Megaways', 'Nova Mines', 'Nova Dice', 'Nova Tower', 'Nova HiLo',
  'Nova Scratch', 'Nova Cups', 'Nova SicBo', 'Nova Penalty', 'Nova Plinko',
  'Nova War', 'Nova RPS', 'Nova Baccarat', 'Nova Dragon Tiger',
  'Nova 777', 'Nova Andar Bahar', 'Nova Race', 'Nova Color', 'Nova Poker',
  'Nova Chicken', 'Nova Sweet', 'Nova Treasure', 'Nova Craps', 'Nova Bingo',
  'Nova Teen Patti',
]

const catPool = ['slots', 'live', 'crash', 'table', 'jackpot', 'slots', 'slots', 'live']

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
  'nova-jackpot': '/games/nova-jackpot/index.html', // ★ slot con jackpot progresivo
  'nova-megaways': '/games/nova-megaways/index.html', // ★ slot estilo Megaways (ways-to-win)
  'nova-tower': '/games/nova-tower/index.html',     // ★ torre del dragón (climb)
  'nova-scratch': '/games/nova-scratch/index.html', // ★ raspadita
  'nova-hilo': '/games/nova-hilo/index.html',       // ★ mayor/menor de cartas
  'nova-cups': '/games/nova-cups/index.html',       // ★ juego del trile (3 vasos)
  'nova-sicbo': '/games/nova-sicbo/index.html',     // ★ sic bo (3 dados)
  'nova-penalty': '/games/nova-penalty/index.html', // ★ penales (atajada/gol)
  'nova-war': '/games/nova-war/index.html',         // ★ casino war (guerra de cartas)
  'nova-rps': '/games/nova-rps/index.html',         // ★ piedra papel o tijera
  'nova-baccarat': '/games/nova-baccarat/index.html', // ★ baccarat / punto y banca
  'nova-dragon-tiger': '/games/nova-dragon/index.html', // ★ dragon tiger (carta más alta)
  'nova-777': '/games/nova-777/index.html',         // ★ slot clásico 3 rodillos
  'nova-andar-bahar': '/games/nova-andarbahar/index.html', // ★ andar bahar (juego indio)
  'nova-race': '/games/nova-race/index.html',       // ★ carrera de corredores
  'nova-color': '/games/nova-color/index.html',     // ★ juego de colores (perya)
  'nova-poker': '/games/nova-poker/index.html',     // ★ video póker (jacks or better)
  'nova-chicken': '/games/nova-chicken/index.html', // ★ cruce de camino tipo crash
  'nova-sweet': '/games/nova-sweet/index.html',     // ★ slot de racimos (cluster pays)
  'nova-treasure': '/games/nova-treasure/index.html', // ★ elige cofre del tesoro
  'nova-craps': '/games/nova-craps/index.html',     // ★ craps línea de pase
  'nova-bingo': '/games/nova-bingo/index.html',     // ★ bingo 5x5
  'nova-teen-patti': '/games/nova-teenpatti/index.html', // ★ teen patti (3 cartas)
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
  'nova-jackpot': '/games/nova-jackpot/thumb.svg',
  'nova-megaways': '/games/nova-megaways/thumb.svg',
  'nova-tower': '/games/nova-tower/thumb.svg',
  'nova-scratch': '/games/nova-scratch/thumb.svg',
  'nova-hilo': '/games/nova-hilo/thumb.svg',
  'nova-cups': '/games/nova-cups/thumb.svg',
  'nova-sicbo': '/games/nova-sicbo/thumb.svg',
  'nova-penalty': '/games/nova-penalty/thumb.svg',
  'nova-war': '/games/nova-war/thumb.svg',
  'nova-rps': '/games/nova-rps/thumb.svg',
  'nova-baccarat': '/games/nova-baccarat/thumb.svg',
  'nova-dragon-tiger': '/games/nova-dragon/thumb.svg',
  'nova-777': '/games/nova-777/thumb.svg',
  'nova-andar-bahar': '/games/nova-andarbahar/thumb.svg',
  'nova-race': '/games/nova-race/thumb.svg',
  'nova-color': '/games/nova-color/thumb.svg',
  'nova-poker': '/games/nova-poker/thumb.svg',
  'nova-chicken': '/games/nova-chicken/thumb.svg',
  'nova-sweet': '/games/nova-sweet/thumb.svg',
  'nova-treasure': '/games/nova-treasure/thumb.svg',
  'nova-craps': '/games/nova-craps/thumb.svg',
  'nova-bingo': '/games/nova-bingo/thumb.svg',
  'nova-teen-patti': '/games/nova-teenpatti/thumb.svg',
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
  'nova-jackpot': 'slots',
  'nova-megaways': 'slots',
  'nova-tower': 'crash',
  'nova-scratch': 'crash',
  'nova-hilo': 'table',
  'nova-cups': 'crash',
  'nova-sicbo': 'table',
  'nova-penalty': 'crash',
  'nova-war': 'table',
  'nova-rps': 'crash',
  'nova-baccarat': 'table',
  'nova-dragon-tiger': 'table',
  'nova-777': 'slots',
  'nova-andar-bahar': 'table',
  'nova-race': 'crash',
  'nova-color': 'crash',
  'nova-poker': 'table',
  'nova-chicken': 'crash',
  'nova-sweet': 'slots',
  'nova-treasure': 'crash',
  'nova-craps': 'table',
  'nova-bingo': 'crash',
  'nova-teen-patti': 'table',
}

// Prefijo de la app (ej. "/BETNOVA" en GitHub Pages, "" en dev). Los embeds/thumbs
// usan rutas absolutas, así que hay que anteponer la base para que carguen.
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
// Versión de assets de juegos: bumpear cuando se corrige un juego, así el iframe
// pide el index.html fresco (evita que el celular sirva una versión vieja cacheada).
const ASSET_V = '20260615d'

export const games = names
  .map((name, i) => {
    const slug = slugify(name)
    return {
      id: i + 1,
      name,
      slug,
      category: cats[slug] || catPool[i % catPool.length],
      provider: 'BetNova',
      cover: covers[i % covers.length],
      hot: i % 5 === 0,
      rtp: (94 + (i % 6)).toFixed(1),
      players: 50 + ((i * 37) % 950),
      embed: embeds[slug] ? base + embeds[slug] + '?v=' + ASSET_V : null,
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
