# Urban Heat & Vegetation Viewer — Bauru, SP (1993–2023)

Live demo: https://tfg-drab.vercel.app

Interactive WebGIS showing vegetation cover loss and urban heat island 
growth in Bauru, São Paulo, Brazil over 30 years (1993–2023).

Built as an undergraduate thesis project at UNESP Presidente Prudente 
(Environmental Engineering, 2023) by Lucas Beillo Oliveira.

## Layers
- **NDVI** — Normalized Difference Vegetation Index (Landsat 5/8, 30m)
- **LST** — Land Surface Temperature (MODIS MOD11A2, 1km)
- **Land Use** — MapBiomas Collection 9 classification (30m)

## Years
1993 · 2003 · 2013 · 2023

## Tech stack
React 18 · Vite · MapLibre GL JS · geotiff.js · Recharts · Tailwind CSS v3 · Vercel

## Data sources
- Landsat Collection 2 SR — USGS via Google Earth Engine
- MODIS MOD11A2 v061 — NASA via Google Earth Engine  
- MapBiomas Collection 9 — mapbiomas.org
- Municipality boundary — IBGE (geocode 3506003)

## Adapting to another city
1. Update `src/config/city.js` (bbox, center, zoom, boundary URL)
2. Replace `public/data/bauru_boundary.geojson`
3. Update ROI in `scripts/gee_export_ndvi_lst.js` and `scripts/gee_export_lulc.js`
4. Re-export COGs from GEE and run `python scripts/convert_to_cog.py`

## Local setup
```
npm install
npm run dev
```

## Data pipeline
```
# Export from Google Earth Engine
# Paste scripts/gee_export_ndvi_lst.js and scripts/gee_export_lulc.js 
# into code.earthengine.google.com and run tasks

# Convert to COG after downloading from Google Drive
python scripts/convert_to_cog.py "path/to/downloaded/folder"
```

> **Note:** COG files (`public/cogs/*.tif`) are gitignored due to size (173 MB).
> Download or regenerate them using the pipeline above.

---
© 2023 Lucas Beillo Oliveira · UNESP Presidente Prudente
