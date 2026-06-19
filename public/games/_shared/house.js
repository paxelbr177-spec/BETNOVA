/* BetNova — "modo casa": controla la probabilidad de ganar SIN que la casa pierda.

   La probabilidad de victoria se ata al MULTIPLICADOR de la jugada:
     prob = min(maxChance, rtp / multiplicador)
   Como prob * multiplicador <= rtp (< 1), el retorno esperado del jugador es
   siempre < 1 → la casa nunca pierde a la larga, sin importar el juego ni el
   multiplicador que elija el jugador.

   - Apuestas de multiplicador BAJO (ej. cara/cruz ~2x) ganan seguido (≈45%) →
     da la "sensación de ganar".
   - Apuestas de multiplicador ALTO (ej. pleno 36x) ganan rara vez → protegen a la casa.

   Para volver a modo normal (sin ventaja artificial), pon rtp = 1 y maxChance = 1.
   allowWin() acepta el multiplicador de la jugada; si no se pasa, asume 2. */
(function () {
  window.NovaHouse = {
    rtp: 0.85,       // la casa devuelve como mucho ~85% → margen ≥15%
    maxChance: 0.45, // tope de frecuencia de victoria para multiplicadores bajos

    allowWin(mult) {
      const m = (typeof mult === 'number' && mult > 1) ? mult : 2
      return Math.random() < Math.min(this.maxChance, this.rtp / m)
    },
  }
})()
