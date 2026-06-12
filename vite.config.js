import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En producción el sitio vive en https://<user>.github.io/BETNOVA/, así que los
// assets deben servirse desde /BETNOVA/. En desarrollo se queda en la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/BETNOVA/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
}))
