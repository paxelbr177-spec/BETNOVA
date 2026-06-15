// Datos de cuenta de ejemplo (mock). Todo ficticio, sin dinero real.
export const user = {
  name: 'Alex Moraes',
  username: 'alexnova',
  email: 'alex@example.com',
  avatarColors: ['#19e57f', '#0a6b3d'],
  memberSince: '2025-03-12',
  level: 'Plata',
  levelProgress: 64, // %
  balance: 842.5,
  bonus: 120.0,
  currency: 'ARS',
  kycVerified: true,
}

export const transactions = [
  { id: 't1', type: 'deposit', method: 'Pix', amount: 200, status: 'ok', date: '2026-06-08 14:21' },
  { id: 't2', type: 'bet', method: 'Casino · Nova Fortune', amount: -25, status: 'ok', date: '2026-06-08 15:02' },
  { id: 't3', type: 'win', method: 'Casino · Nova Fortune', amount: 73.5, status: 'ok', date: '2026-06-08 15:02' },
  { id: 't4', type: 'withdraw', method: 'Pix', amount: -150, status: 'pending', date: '2026-06-09 09:10' },
  { id: 't5', type: 'bet', method: 'Deportes · Río Verde FC', amount: -40, status: 'ok', date: '2026-06-09 18:30' },
  { id: 't6', type: 'deposit', method: 'USDT', amount: 300, status: 'ok', date: '2026-06-10 11:05' },
]

export const bets = [
  {
    id: 'b1', kind: 'sport', event: 'Río Verde FC vs Atlético Costa',
    pick: 'Río Verde FC (1)', odds: 1.85, stake: 40, status: 'won',
    payout: 74, date: '2026-06-09 18:30',
  },
  {
    id: 'b2', kind: 'sport', event: 'Coast Kings vs Metro Wolves',
    pick: 'Metro Wolves (2)', odds: 1.85, stake: 20, status: 'lost',
    payout: 0, date: '2026-06-09 21:00',
  },
  {
    id: 'b3', kind: 'casino', event: 'Nova Fortune',
    pick: 'Giro x10', odds: 2.94, stake: 25, status: 'won',
    payout: 73.5, date: '2026-06-08 15:02',
  },
  {
    id: 'b4', kind: 'sport', event: 'Unión Delta vs Sporting Mar',
    pick: 'Empate (X)', odds: 3.1, stake: 15, status: 'open',
    payout: null, date: '2026-06-10 21:00',
  },
  {
    id: 'b5', kind: 'casino', event: 'Crash Rocket',
    pick: 'Cash out x1.8', odds: 1.8, stake: 30, status: 'lost',
    payout: 0, date: '2026-06-07 22:14',
  },
]

export const paymentMethods = [
  { id: 'pix', label: 'Pix', emoji: '⚡', note: 'Instantáneo' },
  { id: 'card', label: 'Tarjeta', emoji: '💳', note: 'VISA / Mastercard' },
  { id: 'usdt', label: 'USDT', emoji: '₮', note: 'Cripto · TRC20' },
  { id: 'skrill', label: 'Skrill', emoji: '🅢', note: 'Monedero' },
]
