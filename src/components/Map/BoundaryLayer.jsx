import { useEffect } from 'react'
import { CITY } from '../../config/city'

const SOURCE_ID = 'bauru-boundary'
const LAYER_ID = 'bauru-boundary-line'

export default function BoundaryLayer({ map }) {
  useEffect(() => {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: CITY.boundaryUrl,
    })
    map.addLayer({
      id: LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      paint: {
        'line-color': '#ffffff',
        'line-width': 2.5,
        'line-opacity': 0.9,
      },
    })
    // Explicitly move to top so it's always above the raster and mask layers
    map.moveLayer(LAYER_ID)
    return () => {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID)
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
    }
  }, [map])

  return null
}
