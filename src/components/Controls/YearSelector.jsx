import { CITY } from '../../config/city'

const ALL_YEARS = [...new Set([
  ...CITY.yearsNDVI,
  ...CITY.yearsLST,
  ...CITY.yearsLULC,
])].sort((a, b) => a - b).map(String)

const LAYER_YEARS = {
  ndvi: new Set(CITY.yearsNDVI.map(String)),
  lst:  new Set(CITY.yearsLST.map(String)),
  lulc: new Set(CITY.yearsLULC.map(String)),
}

export default function YearSelector({ activeYear, activeLayer, onChange }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-medium">Select year</p>
      <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl border border-white/5">
        {ALL_YEARS.map((year) => {
          const disabled = !(LAYER_YEARS[activeLayer]?.has(year) ?? true)
          const active   = activeYear === year
          return (
            <button
              key={year}
              onClick={() => onChange(year)}
              disabled={disabled}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${active
                  ? 'bg-blue-600 text-white shadow-glow scale-[1.02]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/8'}
                disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:scale-100`}
            >
              {year}
            </button>
          )
        })}
      </div>
    </div>
  )
}
