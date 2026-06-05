import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { useAllStats } from '../../hooks/useStats'

const LABEL = {
  ndvi: 'Non-vegetated area (km²)',
  lst:  'Mean LST (°C)',
  lulc: 'Urban footprint (%)',
}

export default function StatsAreaChart({ activeLayer, activeYear }) {
  const all = useAllStats()

  const data = Object.entries(all)
    .map(([year, s]) => ({
      year,
      value: activeLayer === 'ndvi' ? s.non_vegetated_km2
           : activeLayer === 'lulc' ? s.urban_pct
           : s.lst_mean_c,
    }))
    .filter((d) => d.value !== null)

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">
        {LABEL[activeLayer]}
      </p>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 11 }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <ReferenceLine x={activeYear} stroke="#60a5fa" strokeDasharray="3 3" strokeOpacity={0.7} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            fill="url(#areaGrad)"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
