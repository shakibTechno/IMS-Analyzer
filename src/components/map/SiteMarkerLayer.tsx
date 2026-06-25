// ─── SiteMarkerLayer ─────────────────────────────────────────────
// Renders one Marker per site using pre-built DivIcons.
//
// Icon shapes distinguish asset type:
//   tower    → upward triangle  (passive infrastructure / tower co.)
//   bts      → circle           (active radio base station)
//   nttn_pop → diamond          (NTTN point-of-presence)
//
// Non-active sites get a CSS pulse ring behind the icon:
//   degraded → slow amber pulse (2 s)
//   down     → fast red pulse   (1.2 s)
//
// The pulse animation is injected in index.css as @keyframes sitePulse.

import { Marker } from 'react-leaflet'
import { SITE_ICONS } from './siteIcons'
import SitePopup from './SitePopup'
import type { Site } from '@/types/site'

interface Props {
  sites: Site[]
}

export default function SiteMarkerLayer({ sites }: Props) {
  return (
    <>
      {sites.map(site => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={SITE_ICONS[site.status][site.type]}
        >
          <SitePopup site={site} />
        </Marker>
      ))}
    </>
  )
}
