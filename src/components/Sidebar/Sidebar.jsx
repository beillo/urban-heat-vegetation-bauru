import LayerToggle from '../Controls/LayerToggle'
import YearSelector from '../Controls/YearSelector'
import StatCard from './StatCard'
import StatsAreaChart from './AreaChart'
import Legend from '../Legend'
import { useStats } from '../../hooks/useStats'
import { CITY } from '../../config/city'

const SECTION_TITLE = {
  ndvi: 'Vegetation Cover',
  lst:  'Surface Temperature',
  lulc: 'Land Use / Land Cover',
}

export default function Sidebar({ activeLayer, activeYear, onLayerChange, onYearChange }) {
  const stats = useStats(activeYear)

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto bg-sidebar text-white">

      <LayerToggle activeLayer={activeLayer} onChange={onLayerChange} />
      <YearSelector activeYear={activeYear} activeLayer={activeLayer} onChange={onYearChange} />

      <div className="border-t border-white/5 pt-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">
          {SECTION_TITLE[activeLayer]}
        </p>

        <div className="flex flex-col gap-2.5">
          {activeLayer !== 'lulc' && (
            <StatCard
              label="Non-vegetated area"
              value={stats?.non_vegetated_km2}
              unit="km²"
            />
          )}
          <StatCard
            label="Urban footprint"
            value={stats?.urban_pct}
            unit="%"
          />
          {activeLayer !== 'lulc' && (
            <StatCard
              label="Mean surface temp."
              value={stats?.lst_mean_c}
              unit="°C"
            />
          )}
        </div>
      </div>

      <StatsAreaChart activeLayer={activeLayer} activeYear={activeYear} />

      <div className="border-t border-white/5 pt-4">
        <Legend activeLayer={activeLayer} />
      </div>

      <p className="text-[10px] text-gray-600 mt-auto pt-2 leading-relaxed">
        Sources: USGS Landsat 5/8, NASA MODIS MOD11A2,
        MapBiomas Collection&nbsp;9. Processed in Google Earth Engine.
      </p>
    </div>
  )
}
