import { useEffect } from 'react'
import { removeMapLayer } from '../../hooks/useMapLayer'

const SOURCE_ID = 'sp-municipalities-source'
const LAYER_ID  = 'sp-municipalities-layer'
const IBGE_URL  =
  'https://servicodados.ibge.gov.br/api/v3/malhas/estados/35' +
  '?intrarregiao=municipio&formato=application/vnd.geo%2Bjson&qualidade=intermediaria'

export default function NeighborBoundariesLayer({ map }) {
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(IBGE_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const geojson = await res.json()
        if (cancelled) return

        removeMapLayer(map, SOURCE_ID, LAYER_ID)

        map.addSource(SOURCE_ID, { type: 'geojson', data: geojson })

        map.addLayer({
          id: LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': '#444444',
            'line-width': 0.5,
            'line-opacity': 0.6,
          },
        })

        // Position just below the Bauru boundary so it renders above the mask
        // but below the white outline. MapView.enforceLayerOrder (on idle)
        // will also maintain this order on every subsequent load.
        if (map.getLayer('bauru-boundary-line')) {
          map.moveLayer(LAYER_ID, 'bauru-boundary-line')
        }
      } catch (err) {
        if (!cancelled) console.warn('NeighborBoundariesLayer: failed to load IBGE data', err)
      }
    }

    load()

    return () => {
      cancelled = true
      removeMapLayer(map, SOURCE_ID, LAYER_ID)
    }
  }, [map])

  return null
}
