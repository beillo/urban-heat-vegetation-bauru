export default function StatCard({ label, value, unit }) {
  const hasValue = value !== null && value !== undefined

  return (
    <div className="group bg-card hover:bg-card-hover border border-white/5 hover:border-white/10 rounded-xl p-3.5 transition-all duration-200 cursor-default">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1.5">{label}</p>
      <p className="text-2xl font-bold leading-none">
        {hasValue
          ? <span className="text-white">{value}<span className="text-sm font-normal text-gray-400 ml-1.5">{unit}</span></span>
          : <span className="text-gray-600 text-base font-medium">N/A</span>
        }
      </p>
    </div>
  )
}
