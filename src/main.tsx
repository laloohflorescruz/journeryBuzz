import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import './i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics: visitas y cambios de ruta de la SPA (solo
        cuenta en el despliegue de Vercel; en local no envía nada). */}
    <Analytics />
  </StrictMode>,
)
