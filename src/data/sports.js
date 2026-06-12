// Eventos deportivos de ejemplo (mock). Equipos ficticios.
export const sportsTabs = [
  { id: 'football', label: '⚽ Fútbol' },
  { id: 'basket', label: '🏀 Basket' },
  { id: 'tennis', label: '🎾 Tenis' },
  { id: 'esports', label: '🎮 eSports' },
]

export const events = [
  {
    id: 1, sport: 'football', league: 'Liga Nova', live: true, minute: 63,
    home: 'Río Verde FC', away: 'Atlético Costa', score: [1, 0],
    odds: { '1': 1.85, X: 3.4, '2': 4.2 },
  },
  {
    id: 2, sport: 'football', league: 'Copa Sur', live: true, minute: 28,
    home: 'Unión Delta', away: 'Sporting Mar', score: [0, 0],
    odds: { '1': 2.1, X: 3.1, '2': 3.3 },
  },
  {
    id: 3, sport: 'football', league: 'Liga Nova', live: false, kickoff: '21:00',
    home: 'Palmeira Real', away: 'Boca Nueva', score: null,
    odds: { '1': 1.65, X: 3.8, '2': 5.0 },
  },
  {
    id: 4, sport: 'basket', league: 'Pro Hoops', live: true, minute: 'Q3',
    home: 'Coast Kings', away: 'Metro Wolves', score: [68, 71],
    odds: { '1': 1.95, '2': 1.85 },
  },
  {
    id: 5, sport: 'tennis', league: 'Open Nova', live: false, kickoff: '15:30',
    home: 'A. Ferreira', away: 'L. Romano', score: null,
    odds: { '1': 1.4, '2': 2.9 },
  },
  {
    id: 6, sport: 'esports', league: 'Cyber Cup', live: true, minute: 'Mapa 2',
    home: 'Team Pixel', away: 'Nova Squad', score: [1, 0],
    odds: { '1': 1.7, '2': 2.05 },
  },
  {
    id: 7, sport: 'football', league: 'Copa Sur', live: false, kickoff: '23:15',
    home: 'Estrella FC', away: 'Lagos United', score: null,
    odds: { '1': 2.45, X: 3.2, '2': 2.7 },
  },
  {
    id: 8, sport: 'basket', league: 'Pro Hoops', live: false, kickoff: '20:00',
    home: 'Sky Hawks', away: 'River Bears', score: null,
    odds: { '1': 1.75, '2': 2.0 },
  },
]
