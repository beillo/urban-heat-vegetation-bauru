import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import RasterLayer from './RasterLayer'
import MaskLayer from './MaskLayer'
import BoundaryLayer from './BoundaryLayer'
import NeighborBoundariesLayer from './NeighborBoundariesLayer'
import { CITY } from '../../config/city'

const BASEMAP = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export default function MapView({ activeLayer, activeYear }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Enforces the canonical layer order whenever the map goes idle.
  // Needed because async loads (COG cache, GeoJSON, IBGE) complete in
  // unpredictable order, and StrictMode's unmount/remount can cause the
  // cached raster to land above the mask before the mask re-adds itself.
  //
  // Desired stack (bottom → top):
  //   sp-municipalities-layer < raster-layer < boundary-mask-layer
  //   bauru-boundary-line  →  very top (above all basemap symbols)
  useEffect(() => {
    if (!mapLoaded) return
    const map = mapRef.current

    const USER_STACK = [
      'raster-layer',
      'boundary-mask-layer',
      'sp-municipalities-layer',
    ]

    function enforceLayerOrder() {
      const styleIds = map.getStyle().layers.map(l => l.id)

      // Fast path: check relative order is already correct
      let prevIdx = -1
      let correct = true
      for (const id of USER_STACK) {
        const idx = styleIds.indexOf(id)
        if (idx === -1) continue
        if (idx < prevIdx) { correct = false; break }
        prevIdx = idx
      }
      if (correct) {
        const bIdx = styleIds.indexOf('bauru-boundary-line')
        const topUser = Math.max(...USER_STACK.map(id => styleIds.indexOf(id)).filter(i => i >= 0), -1)
        if (bIdx !== -1 && topUser >= 0 && bIdx < topUser) correct = false
      }
      if (correct) return

      const firstSymbol = map.getStyle().layers.find(l => l.type === 'symbol')?.id
      if (!firstSymbol) return

      // Reposition from highest-desired downward so each move settles in place
      for (let i = USER_STACK.length - 1; i >= 0; i--) {
        const id = USER_STACK[i]
        if (!map.getLayer(id)) continue
        const above = USER_STACK.slice(i + 1).find(aid => map.getLayer(aid))
        try { map.moveLayer(id, above ?? firstSymbol) } catch (_) { /* layer may not exist */ }
      }
      if (map.getLayer('bauru-boundary-line')) {
        map.moveLayer('bauru-boundary-line')   // always at very top
      }
    }

    map.on('idle', enforceLayerOrder)
    return () => { map.off('idle', enforceLayerOrder) }
  }, [mapLoaded])

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP,
      center: CITY.center,
      zoom: CITY.zoom,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      mapRef.current = map
      setMapLoaded(true)
    })

    return () => {
      setMapLoaded(false)
      map.remove()
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      {mapLoaded && (
        <>
          <NeighborBoundariesLayer map={mapRef.current} />
          <RasterLayer map={mapRef.current} layer={activeLayer} year={activeYear} />
          <MaskLayer map={mapRef.current} />
          <BoundaryLayer map={mapRef.current} />
        </>
      )}
    </div>
  )
}
