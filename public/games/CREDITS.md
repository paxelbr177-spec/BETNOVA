# Créditos y licencias de los juegos integrados

Todos los juegos alojados aquí son open-source con licencia verificada. Se conservan
sus avisos de licencia originales según se requiere.

## nova-reels/  ★ juego insignia (original)
- **Origen:** creado por nosotros para BetNova. Slot 5×3 con 10 líneas de pago, símbolo
  *wild*, animación de rodillos, líneas de premio y sonido sintetizado.
- **Motor:** Phaser 3 (MIT) cargado por CDN.
- **Arte:** 8 símbolos SVG originales. **Sonido:** generado con Web Audio (sin samples de terceros).
- **Licencia:** propiedad del proyecto. Cero dependencia de proveedores externos.

## nova-crash/ · nova-mines/ · nova-plinko/ · nova-dice/  ★ juegos originales
- **Origen:** creados por nosotros para BetNova. Vanilla JS + Canvas, sin dependencias.
- **Inspiración:** estética del género (multiplicadores, look dorado/neón). **Arte, mecánica
  y sonido 100% originales** — no se replican personajes ni assets de juegos comerciales.
- **Licencia:** propiedad del proyecto. Cero dependencia de proveedores.
- Nova Crash (multiplicador con cash-out), Nova Mines (5×5 gemas/minas), Nova Plinko
  (bola + clavijas), Nova Dice (mayor/menor, casa 1%).

## nova-joker/  ★ slot original (temática cartas/joker)
- **Origen:** creado por nosotros para BetNova, sobre la base de nuestro propio Nova Reels.
- **Inspiración:** el *estilo* del género de slots de cartas/joker. **NO** se copió ningún
  juego comercial (p. ej. Joker's Revenge de Pragmatic): arte, símbolos (10/J/Q/K/A, corona,
  diamante y un comodín de gorro de bufón), nombre, sonido y matemática son **originales**.
- **Motor:** Phaser 3 (MIT). Sonido Web Audio propio. Efectos de la capa `_shared/`.

## nova-roulette/  ★ ruleta europea
- **Rueda giratoria:** librería **`@theblindhawk/roulette`** — licencia **ISC** (permisiva),
  cargada por CDN (jsDelivr). Solo se usa para la animación de la rueda.
- **Mesa, fichas, lógica de apuestas y pagos:** **originales de BetNova**.
- **Diseño clave:** el número ganador lo decide nuestra lógica (aleatorio justo 0–36);
  a la rueda solo se le pide aterrizar en ese índice. Así los pagos no dependen del render.
- **Sonido:** Web Audio propio. **Sin assets de terceros** salvo la librería ISC.

## neon-slot/
- **Origen:** `johakr/html5-slot-machine` — https://github.com/johakr/html5-slot-machine
- **Licencia del código:** MIT © 2017 Johannes Kronmüller (ver `neon-slot/LICENSE`).
- **Modificaciones nuestras:**
  - Se **eliminaron** los símbolos originales (personajes de Star Wars, con copyright de
    Disney/Lucasfilm) y se **sustituyeron por símbolos propios** (cereza, limón, campana,
    siete, diamante, estrella, trébol, moneda) — arte original.
  - Se **eliminó** la imagen de fondo (foto de terceros) y se reemplazó por un fondo
    estrellado generado con CSS.
  - Pequeños ajustes de estilo en el botón para encajar con BetNova.

## karma-slots/
- **Origen:** `clintbellanger/Karma-Slots` — https://github.com/clintbellanger/Karma-Slots
- **Licencia del código:** MIT © 2012 Clint Bellanger.
- **Licencia del arte y sonidos:** CC-BY 3.0 — arte © 2012 Clint Bellanger;
  sonidos © 2012 Brandon Morris. **Atribución requerida** (se mantiene en pantalla y aquí).
- **Modificaciones nuestras:** solo estilo de presentación (fondo oscuro, escala). La
  lógica del juego no se altera.

## demo-spin/
- **Origen:** creado por nosotros para BetNova. Mini-tragamonedas original.
- **Licencia:** libre de usar dentro de este proyecto. Símbolos = emojis del sistema.

---

> Nota: estos juegos usan lógica simplificada y son solo para **demostración / diversión**.
> Para dinero real se requieren juegos certificados (GLI/iTech Labs), contrato con
> proveedor/agregador y licencia de juego.
