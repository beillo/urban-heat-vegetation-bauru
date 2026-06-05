const LAYERS = [
  { id: 'ndvi', label: 'NDVI',     title: 'Vegetation Index (Landsat)' },
  { id: 'lst',  label: 'LST',      title: 'Land Surface Temperature (MODIS)' },
  { id: 'lulc', label: 'Land Use', title: 'Land Use / Land Cover (MapBiomas)' },
]

export default function LayerToggle({ activeLayer, onChange }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-medium">Layer</p>
      <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl border border-white/5">
        {LAYERS.map(({ id, label, title }) => {
          const active = activeLayer === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              title={title}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${active
                  ? 'bg-emerald-500 text-white shadow-glow shadow-emerald-500/30 scale-[1.02]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/8'}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
