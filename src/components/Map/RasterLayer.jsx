import { useEffect, useState } from 'react'
import { fromArrayBuffer } from 'geotiff'
import { applyColorScale } from '../../utils/colorScales'
import { removeMapLayer } from '../../hooks/useMapLayer'
import { CITY } from '../../config/city'

const SOURCE_ID      = 'raster-source'
const LAYER_ID       = 'raster-layer'
const MASK_LAYER_ID  = 'boundary-mask-layer'
const RENDER_SIZE    = 512

const LAYER_YEARS = {
  ndvi: CITY.yearsNDVI.map(String),
  lst:  CITY.yearsLST.map(String),
  lulc: CITY.yearsLULC.map(String),
}

const cogCache = new Map()

async function fetchCog(url, signal) {
  if (cogCache.has(url)) return cogCache.get(url)
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buf = await response.arrayBuffer()
  cogCache.set(url, buf)
  return buf
}

function backgroundPrefetch(url) {
  if (cogCache.has(url)) return
  fetch(url)
    .then(r => r.ok ? r.arrayBuffer() : null)
    .then(buf => { if (buf) cogCache.set(url, buf) })
    .catch(() => {})
}

function pixelToColor(value, noDataValue, layer, dataMin, dataMax) {
  if (noDataValue !== null && value === noDataValue) return null
  if (isNaN(value) || value < -9000) return null
  return applyColorScale(value, layer, dataMin, dataMax)
}

export default function RasterLayer({ map, layer, year }) {
  const [isLoading, setIsLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const validYears = LAYER_YEARS[layer] ?? []
    if (!validYears.includes(year)) {
      removeMapLayer(map, SOURCE_ID, LAYER_ID)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    setIsLoading(true)
    setUnavailable(false)

    async function loadCog() {
      try {
        const url = `/cogs/${layer}_${year}.tif`
        const arrayBuffer = await fetchCog(url, controller.signal)
        if (cancelled) return

        const tiff  = await fromArrayBuffer(arrayBuffer)
        if (cancelled) return

        const image = await tiff.getImage()
        if (cancelled) return

        const [west, south, east, north] = image.getBoundingBox()
        const imageCoords = [
          [west, north],
          [east, north],
          [east, south],
          [west, south],
        ]

        const noDataValue = image.getGDALNoData()

        const data = await image.readRasters({
          width: RENDER_SIZE,
          height: RENDER_SIZE,
        })
        if (cancelled) return

        const band = data[0]

        // Dynamic range for LST — exclude nodata so the ramp spans real temps.
        // low t (min °C) → cool blue (#e0f3f8), high t (max °C) → hot red (#d73027)
        let dataMin = 0, dataMax = 1
        if (layer === 'lst') {
          let mn = Infinity, mx = -Infinity
          for (const v of band) {
            if (noDataValue !== null && v === noDataValue) continue
            if (v > -9000 && !isNaN(v)) {
              if (v < mn) mn = v
              if (v > mx) mx = v
            }
          }
          if (mn < mx) { dataMin = mn; dataMax = mx }
        }

        const canvas    = document.createElement('canvas')
        canvas.width    = RENDER_SIZE
        canvas.height   = RENDER_SIZE
        const ctx       = canvas.getContext('2d')
        const imageData = ctx.createImageData(RENDER_SIZE, RENDER_SIZE)

        for (let i = 0; i < band.length; i++) {
          const color = pixelToColor(band[i], noDataValue, layer, dataMin, dataMax)
          const idx   = i * 4
          if (color === null) {
            imageData.data[idx + 3] = 0
            continue
          }
          imageData.data[idx]     = parseInt(color.slice(1, 3), 16)
          imageData.data[idx + 1] = parseInt(color.slice(3, 5), 16)
          imageData.data[idx + 2] = parseInt(color.slice(5, 7), 16)
          imageData.data[idx + 3] = 210
        }

        ctx.putImageData(imageData, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')

        removeMapLayer(map, SOURCE_ID, LAYER_ID)

        map.addSource(SOURCE_ID, {
          type: 'image',
          url: dataUrl,
          coordinates: imageCoords,
        })

        const before = map.getLayer(MASK_LAYER_ID) ? MASK_LAYER_ID : undefined
        map.addLayer({
          id: LAYER_ID,
          type: 'raster',
          source: SOURCE_ID,
          paint: { 'raster-opacity': 0.85 },
        }, before)

        // The raster add can bury the boundary line when mask wasn't ready yet
        // (before=undefined → raster appended to top). Always move boundary back up.
        if (map.getLayer('bauru-boundary-line')) {
          map.moveLayer('bauru-boundary-line')
        }

        if (!cancelled) setIsLoading(false)

        const years    = LAYER_YEARS[layer] ?? []
        const nextYear = years[years.indexOf(year) + 1]
        if (nextYear) backgroundPrefetch(`/cogs/${layer}_${nextYear}.tif`)
      } catch (err) {
        if (err.name === 'AbortError') return
        if (!cancelled) {
          setUnavailable(true)
          setIsLoading(false)
        }
      }
    }

    loadCog()

    return () => {
      cancelled = true
      controller.abort()
      removeMapLayer(map, SOURCE_ID, LAYER_ID)
    }
  }, [map, layer, year])

  if (isLoading) return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-10 pb-10">
      <div className="flex items-center gap-3 bg-gray-950/80 backdrop-blur-md border border-white/10 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl">
        <div className="flex gap-1 items-end">
          <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
          <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
        </div>
        <span className="font-medium">Loading raster…</span>
      </div>
    </div>
  )

  if (unavailable) return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="bg-gray-950/85 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-5 text-center shadow-2xl max-w-xs">
        <svg className="w-8 h-8 mx-auto mb-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <p className="text-white text-sm font-semibold">Data unavailable for this year</p>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
          The raster file could not be loaded.<br />Re-export from GEE to fix.
        </p>
      </div>
    </div>
  )

  return null
}
