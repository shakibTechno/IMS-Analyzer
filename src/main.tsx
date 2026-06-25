import { createRoot } from 'react-dom/client'

// Leaflet CSS must be imported globally before any map component renders
import 'leaflet/dist/leaflet.css'

import './index.css'
import App from './App.tsx'

// StrictMode is intentionally omitted: react-leaflet uses imperative DOM
// manipulation that doesn't survive React 19's double-mount behavior.
createRoot(document.getElementById('root')!).render(
  <App />
)
