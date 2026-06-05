import { useEffect } from 'react'
import { removeMapLayer } from '../../hooks/useMapLayer'
import { CITY } from '../../config/city'

const MASK_SOURCE = 'boundary-mask-source'
export const MASK_LAYER = 'boundary-mask-layer'

// Large ring enclosing the entire world — used as the outer polygon of the mask
const WORLD_RING = [
  [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90],
]

export default function MaskLayer({ map }) {
  useEffect(() => {
    let cancelled = false

    async function loadMask() {
      const res = await fetch(CITY.boundaryUrl)
      const boundary = await res.json()
      if (cancelled) return

      // Collect all polygon coordinate rings from the boundary
      // Works for both Polygon and MultiPolygon geometry types
      const bauruRings = boundary.features.flatMap(f => {
        const geom = f.geometry
        if (geom.type === 'Polygon')      return geom.coordinates
        if (geom.type === 'MultiPolygon') return geom.coordinates.flat()
        return []
      })

      // World polygon with Bauru cut out as holes → fills everything OUTSIDE the boundary
      const maskFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [WORLD_RING, ...bauruRings],
        },
      }

      removeMapLayer(map, MASK_SOURCE, MASK_LAYER)

      map.addSource(MASK_SOURCE, {
        type: 'geojson',
        data: maskFeature,
      })

      // Insert below the basemap's first symbol (label) layer so city/road
      // labels remain visible on top of the mask
      const firstSymbol = map.getStyle().layers.find(l => l.type === 'symbol')?.id

      map.addLayer({
        id: MASK_LAYER,
        type: 'fill',
        source: MASK_SOURCE,
        paint: {
          'fill-color': '#13151a',  // CartoDB Dark Matter background
          'fill-opacity': 1,
        },
      }, firstSymbol)

      // Guarantee boundary line stays above the mask regardless of async order
      if (map.getLayer('bauru-boundary-line')) {
        map.moveLayer('bauru-boundary-line')
      }
    }

    loadMask().catch(console.error)

    return () => {
      cancelled = true
      removeMapLayer(map, MASK_SOURCE, MASK_LAYER)
    }
  }, [map])

  return null
}
