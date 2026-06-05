import { useState } from 'react'
import MapView from './components/Map/MapView'
import Sidebar from './components/Sidebar/Sidebar'
import { CITY } from './config/city'

const LAYER_YEARS = {
  ndvi: CITY.yearsNDVI.map(String),
  lst:  CITY.yearsLST.map(String),
  lulc: CITY.yearsLULC.map(String),
}

const allYears  = [...CITY.yearsNDVI, ...CITY.yearsLST, ...CITY.yearsLULC]
const firstYear = Math.min(...allYears)
const lastYear  = Math.max(...allYears)

function IconDocument() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
    </svg>
  )
}

function IconGitHub() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  )
}

export default function App() {
  const [activeLayer, setActiveLayer] = useState('ndvi')
  const [activeYear, setActiveYear]   = useState(String(CITY.yearsNDVI.at(-1)))

  function handleLayerChange(layer) {
    setActiveLayer(layer)
    const valid = LAYER_YEARS[layer]
    if (!valid.includes(activeYear)) setActiveYear(valid[0])
  }

  const noData = !LAYER_YEARS[activeLayer]?.includes(activeYear)

  return (
    <div className="flex flex-col h-screen">
      <header className="shrink-0 z-20 shadow-lg border-b border-white/5"
        style={{ background: 'linear-gradient(135deg, #080e1f 0%, #0f2045 45%, #0a1628 100%)' }}>

        <div className="flex items-center gap-4 px-5 py-2.5">
          {/* Title + subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm md:text-[15px] leading-tight tracking-tight">
              Urban Heat &amp; Vegetation Viewer
              <span className="text-blue-300/80 font-normal"> — Bauru, São Paulo, Brazil</span>
            </h1>
            <p className="text-gray-500 text-[11px] leading-snug mt-0.5 hidden md:block">
              Spatio-temporal analysis of vegetation cover and urban heat island ({firstYear}–{lastYear}).
              {' '}Data: Landsat 5/8 · MODIS MOD11A2 · MapBiomas Collection 9 · Google Earth Engine.
              <span className="text-white/50"> · Undergraduate thesis by Lucas Beillo Oliveira · UNESP Presidente Prudente · 2023</span>
            </p>
          </div>

          {/* Action links */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/tfg.pdf"
              target="_blank"
              rel="noopener noreferrer"
              title="Open TFG thesis PDF"
              className="flex items-center gap-1.5 text-[11px] font-medium text-gray-300 hover:text-white bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-all duration-200"
            >
              <IconDocument />
              <span className="hidden sm:inline">TFG PDF</span>
            </a>

            <a
              href="https://github.com/beillo"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub — @beillo"
              className="flex items-center text-gray-300 hover:text-white bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 rounded-lg p-1.5 transition-all duration-200"
            >
              <IconGitHub />
            </a>

            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

            <img
              src="/assets/unesp.svg"
              alt="UNESP — Câmpus de Presidente Prudente"
              className="h-8 opacity-85 hover:opacity-100 transition-opacity hidden sm:block"
              style={{ filter: 'invert(1) hue-rotate(180deg)' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-hidden">
          <Sidebar
            activeLayer={activeLayer}
            activeYear={activeYear}
            onLayerChange={handleLayerChange}
            onYearChange={setActiveYear}
          />
        </aside>

        <main className="flex-1 relative">
          <MapView activeLayer={activeLayer} activeYear={activeYear} />
          {noData && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <div className="text-center px-8 py-6 bg-gray-950/80 rounded-2xl border border-white/10 shadow-2xl">
                <p className="text-white text-base font-semibold">
                  LST data not available for {activeYear}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  MODIS coverage starts in 2000
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
