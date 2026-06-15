/* BetNova — "modo casa": controla la probabilidad de que una jugada pueda GANAR.
   winChance = 0.10  →  ~10% de las jugadas pueden ganar (90% pierden).
   Para volver a lo normal, pon winChance = 1.

   Los juegos generan su resultado condicionado a NovaHouse.allowWin(), así no
   hay desajuste visual (si toca perder, se muestra un resultado perdedor). */
(function () {
  window.NovaHouse = {
    winChance: 0.10, // <-- AJUSTA AQUÍ (0.10 = 10% hoy; 1 = normal)
    allowWin() { return Math.random() < this.winChance },
  }
})()
