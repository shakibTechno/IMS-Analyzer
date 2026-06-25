// ─── FullscreenControl ────────────────────────────────────────────
// Adds a Leaflet control button that toggles the map container
// into browser fullscreen mode.
//
// On enter: calls map.getContainer().requestFullscreen()
// On exit:  calls document.exitFullscreen()
// On either transition: calls map.invalidateSize() after 200 ms so
// Leaflet re-measures its new dimensions.

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// SVG icons — expand (four outward arrows) and compress (four inward)
const SVG_EXPAND = `
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
       stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9,1 13,1 13,5"/>
    <polyline points="5,1 1,1 1,5"/>
    <polyline points="1,9 1,13 5,13"/>
    <polyline points="13,9 13,13 9,13"/>
    <line x1="13" y1="1" x2="8.5" y2="5.5"/>
    <line x1="1"  y1="1" x2="5.5" y2="5.5"/>
    <line x1="1"  y1="13" x2="5.5" y2="8.5"/>
    <line x1="13" y1="13" x2="8.5" y2="8.5"/>
  </svg>`

const SVG_COMPRESS = `
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
       stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9,5 13,5 13,1"/>
    <polyline points="1,5 5,5 5,1"/>
    <polyline points="5,9 5,13 1,13"/>
    <polyline points="9,9 9,13 13,13"/>
    <line x1="13" y1="1" x2="8.5" y2="5.5"/>
    <line x1="1"  y1="1" x2="5.5" y2="5.5"/>
    <line x1="1"  y1="13" x2="5.5" y2="8.5"/>
    <line x1="13" y1="13" x2="8.5" y2="8.5"/>
  </svg>`

export default function FullscreenControl() {
  const map    = useMap()
  const btnRef = useRef<HTMLAnchorElement | null>(null)

  // Listen for fullscreen transitions — update icon + re-measure
  useEffect(() => {
    function onFsChange() {
      const isFs = !!document.fullscreenElement
      if (btnRef.current) {
        btnRef.current.innerHTML = isFs ? SVG_COMPRESS : SVG_EXPAND
        btnRef.current.title     = isFs ? 'Exit full screen' : 'Full screen'
      }
      // Give the browser time to complete the fullscreen transition
      setTimeout(() => map.invalidateSize(), 200)
    }
    document.addEventListener('fullscreenchange',       onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange',       onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
    }
  }, [map])

  // Add the Leaflet control button
  useEffect(() => {
    const FSControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')

        const a         = L.DomUtil.create('a', '', div) as HTMLAnchorElement
        a.href          = '#'
        a.title         = 'Full screen'
        a.innerHTML     = SVG_EXPAND
        a.style.cssText = [
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'width:30px',
          'height:30px',
          'color:#555',
          'cursor:pointer',
        ].join(';')

        btnRef.current = a

        L.DomEvent.on(a, 'click', (e: Event) => {
          L.DomEvent.preventDefault(e)
          L.DomEvent.stopPropagation(e)
          if (!document.fullscreenElement) {
            // Go up two levels: leaflet-container → BaseMap wrapper → map-wrapper
            // (map-wrapper also holds the layers panel overlay, so it stays visible in fullscreen)
            const fsTarget =
              map.getContainer().parentElement?.parentElement ??
              map.getContainer()
            fsTarget.requestFullscreen().catch(console.warn)
          } else {
            document.exitFullscreen().catch(console.warn)
          }
        })

        return div
      },
      onRemove() {
        btnRef.current = null
      },
    })

    const ctrl = new FSControl({ position: 'topleft' })
    ctrl.addTo(map)
    return () => { ctrl.remove() }
  }, [map])

  return null
}
