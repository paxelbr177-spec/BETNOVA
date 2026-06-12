# BetNova — Maqueta de casino & apuestas (demo)

Sitio **original** inspirado en la estructura típica de plataformas de casino/apuestas.
Marca, textos, colores y datos son ficticios y creados solo como maqueta. **Sin dinero real.**

## Stack
- React 18 + Vite
- Tailwind CSS
- React Router (maqueta multipágina)

## Páginas
- `/` Inicio (hero, jackpots, juegos destacados, apuestas en vivo, CTA)
- `/casino` Catálogo con filtros por categoría y buscador
- `/deportes` Eventos con pestañas por deporte y filtro "en vivo"
- `/promociones` Bonos y pasos para reclamarlos
- `/login` y `/registro` con validación de formulario
- `*` Página 404

## Cómo ejecutar
```bash
npm install
npm run dev      # arranca en http://localhost:5173
npm run build    # build de producción en /dist
npm run preview  # sirve el build
```

## Notas
- Todos los datos viven en `src/data/` (juegos y eventos de ejemplo).
- Las "portadas" de los juegos se generan con gradientes CSS (sin imágenes externas).
- Login/registro son simulados (no hay backend): validan y redirigen.

## Aviso legal
Operar apuestas/casino con dinero real requiere licencia y cumplimiento normativo
según el país. Esta maqueta no incluye lógica de pagos ni de juego real.
+18 · Juego responsable.
