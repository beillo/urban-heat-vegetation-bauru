import { NDVI_COLORS, LST_COLORS, LULC_CLASSES } from '../utils/colorScales'

const CONFIG = {
  ndvi: {
    stops:  NDVI_COLORS,
    labels: ['0.8', '0.6', '0.4', '0.2', '0.0'],
    unit:   'NDVI  (−1 → +1)',
    pct:    (val) => (val / 0.8) * 100,
  },
  lst: {
    stops:  LST_COLORS,
    labels: ['35 °C', '32 °C', '29 °C', '26 °C'],
    unit:   'Surface Temperature',
    pct:    (val) => ((val - 26) / (35 - 26)) * 100,
  },
}

// Only render LULC classes that have a real color (skip null / no-data entries)
const LULC_ENTRIES = Object.entries(LULC_CLASSES).filter(([, { color }]) => color !== null)

export default function Legend({ activeLayer }) {
  if (activeLayer === 'lulc') {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">
          Land Cover
        </p>
        <div className="flex flex-col gap-1">
          {LULC_ENTRIES.map(([id, { label, color }]) => (
            <div key={id} className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-[3px] flex-shrink-0 ring-1 ring-black/20"
                style={{ background: color }}
              />
              <span className="text-xs text-gray-300 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { stops, labels, unit, pct } = CONFIG[activeLayer]

  const gradient = stops
    .map(([val, color]) => `${color} ${pct(val).toFixed(1)}%`)
    .join(', ')

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">{unit}</p>
      <div className="flex items-stretch gap-3">
        <div
          className="w-4 rounded-md flex-shrink-0 ring-1 ring-black/30"
          style={{ background: `linear-gradient(to top, ${gradient})`, minHeight: '96px' }}
        />
        <div className="flex flex-col justify-between">
          {labels.map((label) => (
            <span key={label} className="text-[11px] text-gray-400 leading-none">{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
