import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El sitio se sirve en la RAÍZ del dominio propio (https://betnovaar.online/),
// así que la base es '/'. (Antes era '/BETNOVA/' para github.io/BETNOVA/.)
export default defineConfig(() => ({
  base: '/',
  plugins: [react()],
  server: { port: 5173, open: true },
}))
