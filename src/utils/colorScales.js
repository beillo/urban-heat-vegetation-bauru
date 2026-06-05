const NDVI_COLORS = [
  [0.0,  '#d73027'],
  [0.2,  '#f46d43'],
  [0.35, '#fee08b'],
  [0.5,  '#a6d96a'],
  [0.65, '#1a9641'],
  [0.8,  '#006837'],
]

// Exported for Legend display (fixed reference scale)
const LST_COLORS = [
  [26, '#e0f3f8'],
  [29, '#ffffbf'],
  [32, '#fc8d59'],
  [35, '#d73027'],
]

// Normalized ramp used for dynamic per-tile rendering
const LST_RAMP = [
  [0.00, '#e0f3f8'],
  [0.33, '#ffffbf'],
  [0.67, '#fc8d59'],
  [1.00, '#d73027'],
]

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

function interpolate(stops, value) {
  const clamped = Math.max(stops[0][0], Math.min(stops[stops.length - 1][0], value))
  for (let i = 0; i < stops.length - 1; i++) {
    const [lo, colorLo] = stops[i]
    const [hi, colorHi] = stops[i + 1]
    if (clamped >= lo && clamped <= hi) {
      const t = (clamped - lo) / (hi - lo)
      const a = hexToRgb(colorLo)
      const b = hexToRgb(colorHi)
      const r = Math.round(a.r + t * (b.r - a.r))
      const g = Math.round(a.g + t * (b.g - a.g))
      const bv = Math.round(a.b + t * (b.b - a.b))
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`
    }
  }
  return stops[stops.length - 1][1]
}

export function ndviToColor(value) {
  return interpolate(NDVI_COLORS, value)
}

export function lstToColor(value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return interpolate(LST_RAMP, t)
}

export function applyColorScale(value, layer, dataMin, dataMax) {
  if (layer === 'ndvi') return ndviToColor(value)
  if (layer === 'lulc') return lulcToColor(Math.round(value))
  return lstToColor(value, dataMin, dataMax)
}

export { NDVI_COLORS, LST_COLORS }

// MapBiomas Collection 9 official class colors
export const LULC_CLASSES = {
  3:  { label: 'Forest',          color: '#1f8d49' },
  4:  { label: 'Savanna',         color: '#7dc975' },
  9:  { label: 'Savanna Forest',  color: '#77a605' },
  11: { label: 'Wetland',         color: '#45b2d3' },
  12: { label: 'Grassland',       color: '#d6bc74' },
  15: { label: 'Pasture',         color: '#edde8e' },
  18: { label: 'Agriculture',     color: '#E974ED' },
  20: { label: 'Sugar Cane',      color: '#d6bc74' },
  21: { label: 'Mosaic',          color: '#ffa07a' },
  24: { label: 'Urban',           color: '#d4271e' },
  25: { label: 'Non-observed',    color: null       },
  33: { label: 'Water',           color: '#2532e4' },
  36: { label: 'Perennial Crop',  color: '#db7093' },
  39: { label: 'Soy',             color: '#f5b843' },
  41: { label: 'Other Crops',     color: '#c3a83b' },
}

export function lulcToColor(classId) {
  return LULC_CLASSES[classId]?.color ?? null
}
