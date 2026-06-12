# Juegos HTML5 self-hosted

Esta carpeta aloja los juegos que se incrustan en BetNova mediante el componente
`GameFrame` (un `<iframe>`). El modelo es el mismo que usan los casinos reales:
**el juego es contenido independiente que tú sirves**, y la app solo lo incrusta.

## Cómo añadir un juego

1. Consigue un juego HTML5 **open-source** (licencia MIT / Apache / GPL) — por
   ejemplo, slots hechos con **Phaser** o **PixiJS**. Revisa siempre su archivo
   `LICENSE` y que sus gráficos/sonidos NO sean de un juego comercial con copyright.
2. Copia la carpeta del juego aquí:
   ```
   public/games/mi-juego/
     ├── index.html      ← punto de entrada
     ├── assets/...
     └── ...
   ```
3. Regístralo en `src/data/games.js`, dentro del objeto `embeds`:
   ```js
   const embeds = {
     'mi-juego-slug': '/games/mi-juego/index.html',
   }
   ```
   (el *slug* se genera del nombre del juego; míralo en la consola o usa `slugify`).
4. Listo: al abrir el detalle del juego y pulsar **play**, se cargará en el iframe.

## Ejemplo incluido

`demo-spin/` es un mini-tragamonedas **original** (símbolos = emojis del sistema,
sin assets con copyright). Sirve solo para comprobar que el loader funciona.
Está enlazado a los juegos "Nova Fortune" y "Mystic Reels".

## Importante (legal)

- **Demo / diversión:** puedes usar juegos open-source self-hosted sin problema.
- **Dinero real:** requiere juegos *certificados* (GLI/iTech Labs) y un contrato con
  el proveedor o un agregador (SoftSwiss, EveryMatrix…), además de licencia de juego.
  Eso **no** se resuelve con repos gratuitos de GitHub.
- **Evita** repos que solo "reenvían" a las URLs *demo* de Pragmatic/Evolution/etc.:
  suelen violar los términos de esos proveedores y dejan de funcionar.
