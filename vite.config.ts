import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Puerto preferido para Buzz (5175); no estricto — si está ocupado, Vite usa
  // otro y el backend en desarrollo acepta cualquier origen local (CORS abierto).
  server: { port: 5175 },
})
