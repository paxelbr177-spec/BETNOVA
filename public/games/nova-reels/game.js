/* ============================================================
   Nova Reels — slot 5x3 ORIGINAL para BetNova
   Motor: Phaser 3 (MIT). Arte SVG y sonido 100% propios.
   Solo demostración · saldo ficticio · sin dinero real.
   ============================================================ */
(function () {
  // ---- Config del tablero ----
  const COLS = 5, ROWS = 3, SYM = 108, PAD = 16;
  const BOARD_W = COLS * SYM + PAD * 2;
  const BOARD_H = ROWS * SYM + PAD * 2;

  // ---- Símbolos y pagos (multiplicador de apuesta por línea, para 3/4/5) ----
  const SYMBOLS = [
    { key: 'gem_blue',   pay: [0, 0, 5, 10, 25] },
    { key: 'gem_green',  pay: [0, 0, 5, 15, 30] },
    { key: 'gem_purple', pay: [0, 0, 8, 20, 40] },
    { key: 'gem_red',    pay: [0, 0, 10, 25, 50] },
    { key: 'bell',       pay: [0, 0, 15, 40, 80] },
    { key: 'seven',      pay: [0, 0, 25, 75, 150] },
    { key: 'crown',      pay: [0, 0, 50, 150, 500] },
    { key: 'wild',       pay: [0, 0, 50, 200, 1000], wild: true },
  ];
  const DEF = Object.fromEntries(SYMBOLS.map((s) => [s.key, s]));

  // Frecuencia en los rodillos (los altos salen menos)
  const WEIGHTS = {
    gem_blue: 22, gem_green: 20, gem_purple: 16, gem_red: 14,
    bell: 10, seven: 6, crown: 3, wild: 5,
  };
  const POOL = [];
  Object.entries(WEIGHTS).forEach(([k, w]) => { for (let i = 0; i < w; i++) POOL.push(k); });
  const randSym = () => POOL[(Math.random() * POOL.length) | 0];

  // 10 líneas de pago (índice de fila por columna: 0=arriba,1=medio,2=abajo)
  const LINES = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 1, 1, 0],
  ];
  const LINE_COLORS = [0x19e57f, 0xffc83d, 0x36d0ff, 0xa45bff, 0xff4d5e,
    0x2bbd6a, 0xff8c5b, 0x5b8cff, 0xc0ff5b, 0xff5b8c];

  // ---- Estado del juego ----
  const BET_LEVELS = [5, 10, 20, 50, 100];
  let betIndex = 0;
  let balance = 1000;
  // Conexión con la billetera de BetNova (saldo real) o demo local si va suelto.
  if (window.NovaWallet) {
    NovaWallet.ready((b) => { balance = b; syncUI(); });
    NovaWallet.onBalance((b) => { balance = b; syncUI(); });
  }
  let spinning = false;
  let autoplay = false;

  // ---- Audio sintetizado (original, sin samples de terceros) ----
  let actx = null;
  function audio() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol) {
    const c = audio(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (dur || 0.15));
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + (dur || 0.15));
  }
  const sndStop = () => tone(180 + Math.random() * 40, 0.09, 'square', 0.08);
  const sndSpin = () => tone(420, 0.18, 'sawtooth', 0.05);
  function sndWin(big) {
    const notes = big ? [523, 659, 784, 1047, 1319] : [523, 659, 784];
    notes.forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.14), i * 90));
  }

  // ---- Escena principal ----
  class Slot extends Phaser.Scene {
    constructor() { super('slot'); }

    preload() {
      SYMBOLS.forEach((s) =>
        this.load.svg('sym_' + s.key, 'symbols/' + s.key + '.svg', { width: 200, height: 200 }));
    }

    create() {
      // Panel de fondo
      const g = this.add.graphics();
      g.fillStyle(0x0c1322, 1).fillRoundedRect(0, 0, BOARD_W, BOARD_H, 14);
      // Celdas
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          g.fillStyle((c + r) % 2 ? 0x141d31 : 0x10182a, 1)
            .fillRoundedRect(PAD + c * SYM + 3, PAD + r * SYM + 3, SYM - 6, SYM - 6, 10);
        }
      }
      // Separadores verticales
      g.lineStyle(2, 0x1f2a44, 1);
      for (let c = 1; c < COLS; c++) g.lineBetween(PAD + c * SYM, PAD + 4, PAD + c * SYM, BOARD_H - PAD - 4);

      // Overlay para líneas de premio
      this.lineGfx = this.add.graphics().setDepth(20);

      // Construir rodillos
      this.reels = [];
      for (let c = 0; c < COLS; c++) this.reels.push(this.buildReel(c, [randSym(), randSym(), randSym()]));

      // Texto flotante de premio
      this.winText = this.add.text(BOARD_W / 2, BOARD_H / 2, '', {
        fontFamily: 'Segoe UI, sans-serif', fontSize: '46px', fontStyle: 'bold',
        color: '#ffc83d', stroke: '#0a0e1a', strokeThickness: 6,
      }).setOrigin(0.5).setDepth(30).setAlpha(0);

      // API para el DOM
      window.NovaReels = {
        spin: () => this.spin(),
        setAuto: (v) => { autoplay = v; if (v && !spinning) this.spin(); },
      };
      syncUI();
    }

    buildReel(col, targets) {
      const reelX = PAD + col * SYM;
      if (this.reels && this.reels[col] && this.reels[col].container) this.reels[col].container.destroy();

      const container = this.add.container(reelX, 0).setDepth(10);
      // strip: 3 targets arriba + 20 aleatorios debajo
      const FILL = 20;
      const strip = [targets[0], targets[1], targets[2]];
      for (let i = 0; i < FILL; i++) strip.push(randSym());

      const sprites = strip.map((key, i) => {
        const img = this.add.image(SYM / 2, PAD + i * SYM + SYM / 2, 'sym_' + key);
        img.setDisplaySize(SYM * 0.82, SYM * 0.82);
        img.symKey = key;
        container.add(img);
        return img;
      });

      // Máscara de la ventana visible (3 filas)
      const mg = this.make.graphics({ x: 0, y: 0, add: false });
      mg.fillRect(reelX, PAD, SYM, ROWS * SYM);
      container.setMask(mg.createGeometryMask());

      container.y = 0; // estado en reposo: muestra los 3 targets
      return { container, sprites, cells: [sprites[0], sprites[1], sprites[2]], col };
    }

    spin() {
      if (spinning) return;
      const bet = BET_LEVELS[betIndex];
      if (balance < bet) { setMessage('Saldo insuficiente para esta apuesta.', true); autoplay = false; syncUI(); return; }

      spinning = true;
      balance = window.NovaWallet ? NovaWallet.bet(bet) : balance - bet;
      this.lineGfx.clear();
      this.winText.setAlpha(0);
      setMessage('Girando…');
      syncWin(0);
      syncUI();
      sndSpin();

      // Resultado aleatorio por columna
      const result = [];
      for (let c = 0; c < COLS; c++) result.push([randSym(), randSym(), randSym()]);

      let stopped = 0;
      for (let c = 0; c < COLS; c++) {
        const reel = this.buildReel(c, result[c]);
        this.reels[c] = reel;
        const FILL = 20;
        reel.container.y = -(FILL * SYM); // arranca mostrando los aleatorios de abajo
        this.tweens.add({
          targets: reel.container,
          y: 0,
          duration: 650 + c * 140,
          delay: c * 110,
          ease: 'Quint.easeOut',
          onComplete: () => {
            sndStop();
            stopped++;
            if (stopped === COLS) this.evaluate(result, bet);
          },
        });
      }
    }

    evaluate(result, bet) {
      const lineBet = bet / LINES.length;
      let totalWin = 0;
      const winningCells = []; // {col,row}
      const winLines = [];     // {line, count, color}

      LINES.forEach((line, li) => {
        const row = line.map((r, c) => result[c][r]); // 5 símbolos de la línea
        // símbolo objetivo: primer no-wild (los wild sustituyen)
        let target = row[0] === 'wild' ? (row.find((s) => s !== 'wild') || 'wild') : row[0];
        let count = 0;
        for (const s of row) { if (s === target || s === 'wild') count++; else break; }
        let pay = count >= 3 ? DEF[target].pay[count] : 0;

        // prefijo de wilds puros (puede pagar más con la tabla del wild)
        let wc = 0; for (const s of row) { if (s === 'wild') wc++; else break; }
        if (wc >= 3 && DEF.wild.pay[wc] > pay) { pay = DEF.wild.pay[wc]; count = wc; target = 'wild'; }

        if (pay > 0) {
          totalWin += pay * lineBet;
          winLines.push({ line, count, color: LINE_COLORS[li % LINE_COLORS.length] });
          for (let c = 0; c < count; c++) winningCells.push({ col: c, row: line[c] });
        }
      });

      if (totalWin > 0) {
        balance = window.NovaWallet ? NovaWallet.win(totalWin) : balance + totalWin;
        const big = totalWin >= bet * 5;
        this.showWin(totalWin, winLines, winningCells, big);
        sndWin(big);
        setMessage(big ? '🎉 ¡GRAN PREMIO!' : '✨ ¡Has ganado!');
        if (window.Juice) { if (big) Juice.bigWin(totalWin, { label: '🎉 ¡GRAN PREMIO!' }); else Juice.coins({ count: 50 }); }
      } else {
        setMessage('¡Suerte la próxima!');
      }
      spinning = false; // liberar ANTES de syncUI para reactivar el botón GIRAR
      syncWin(totalWin);
      syncUI();

      if (autoplay) this.time.delayedCall(totalWin > 0 ? 1600 : 700, () => { if (autoplay) this.spin(); });
    }

    showWin(amount, winLines, cells, big) {
      // Resaltar símbolos ganadores
      cells.forEach(({ col, row }) => {
        const sprite = this.reels[col].cells[row];
        if (!sprite) return;
        this.tweens.add({
          targets: sprite, scaleX: sprite.scaleX * 1.18, scaleY: sprite.scaleY * 1.18,
          duration: 280, yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
        });
      });
      // Dibujar líneas ganadoras
      this.lineGfx.clear();
      winLines.forEach((wl) => {
        this.lineGfx.lineStyle(4, wl.color, 0.9);
        this.lineGfx.beginPath();
        for (let c = 0; c < wl.count; c++) {
          const x = PAD + c * SYM + SYM / 2;
          const y = PAD + wl.line[c] * SYM + SYM / 2;
          if (c === 0) this.lineGfx.moveTo(x, y); else this.lineGfx.lineTo(x, y);
        }
        this.lineGfx.strokePath();
      });
      // Texto flotante
      this.winText.setText('+' + amount.toFixed(2)).setAlpha(1).setScale(0.6);
      this.tweens.add({ targets: this.winText, scale: 1, duration: 350, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.winText, alpha: 0, delay: 1300, duration: 400 });
    }
  }

  // ---- Puente con el DOM (HUD y controles) ----
  const $ = (id) => document.getElementById(id);
  function fmt(n) { return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function setMessage(t) { $('message').textContent = t; }
  function syncWin(w) { $('winDisplay').textContent = fmt(w); }
  function syncUI() {
    $('balance').textContent = fmt(balance);
    $('betDisplay').textContent = fmt(BET_LEVELS[betIndex]);
    $('betValue').textContent = BET_LEVELS[betIndex];
    $('spinBtn').disabled = spinning;
    $('autoBtn').classList.toggle('on', autoplay);
  }

  window.addEventListener('load', () => {
    new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: BOARD_W,
      height: BOARD_H,
      backgroundColor: '#0c1322',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
      scene: [Slot],
    });

    $('spinBtn').addEventListener('click', () => { audio(); window.NovaReels && window.NovaReels.spin(); });
    $('autoBtn').addEventListener('click', () => { audio(); autoplay = !autoplay; window.NovaReels && window.NovaReels.setAuto(autoplay); syncUI(); });
    $('betUp').addEventListener('click', () => { if (!spinning && betIndex < BET_LEVELS.length - 1) { betIndex++; syncUI(); } });
    $('betDown').addEventListener('click', () => { if (!spinning && betIndex > 0) { betIndex--; syncUI(); } });
    document.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); audio(); window.NovaReels && window.NovaReels.spin(); } });
  });
})();
