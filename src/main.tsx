import { registerSW } from 'virtual:pwa-register'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
// Self-hosted fonts so the PWA works offline. Import without `.css`: fontsource's
// exports map appends it, so `800.css` would resolve to `800.css.css`.
import '@fontsource/big-shoulders-stencil-display/latin-800'
import '@fontsource/barlow-condensed/latin-600'
import '@fontsource/barlow-condensed/latin-700'
import '@fontsource/barlow/latin-400'
import '@fontsource/barlow/latin-600'
import '@/index.css'
import { StoreProvider } from '@/store'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
