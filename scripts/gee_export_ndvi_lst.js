/**
 * GEE Script A — NDVI + LST exports for Bauru, SP
 *
 * Paste this script into code.earthengine.google.com and click Run.
 * Each Export task must be started manually in the Tasks panel.
 *
 * Output folder in Google Drive: bauru_webgis
 * Files: ndvi_1993, ndvi_2003, ndvi_2013, ndvi_2023, lst_2003, lst_2013, lst_2023
 *
 * After download: run scripts/convert_to_cog.sh to convert to COG format.
 */

// ── Study area ────────────────────────────────────────────────────────────────
var roi = ee.Geometry.Rectangle([-49.55, -22.85, -48.75, -21.95]); // W S E N

// ── Landsat Collection 2 SR — cloud masking ───────────────────────────────────
// QA_PIXEL bits: 0=fill, 1=dilated cloud, 2=cirrus, 3=cloud shadow, 4=cloud
function maskL2sr(image) {
  var qa = image.select('QA_PIXEL');
  var cloudBits = qa.bitwiseAnd(parseInt('11111', 2)).eq(0); // bits 0-4
  return image.updateMask(cloudBits);
}

// ── Landsat Collection 2 SR — reflectance scaling ────────────────────────────
// Collection 2 SR scale: DN * 0.0000275 + (-0.2) → surface reflectance
function scaleReflectance(image) {
  var optical = image.select('SR_B.*').multiply(0.0000275).add(-0.2);
  return image.addBands(optical, null, true);
}

// ── NDVI helper ───────────────────────────────────────────────────────────────
function computeNDVI(image, nirBand, redBand) {
  return image.normalizedDifference([nirBand, redBand]).rename('NDVI');
}

// ── Landsat sensor configs ────────────────────────────────────────────────────
var landsatConfig = {
  '1993': { collection: 'LANDSAT/LT05/C02/T1_L2', nir: 'SR_B4', red: 'SR_B3' }, // L5 TM
  '2003': { collection: 'LANDSAT/LT05/C02/T1_L2', nir: 'SR_B4', red: 'SR_B3' }, // L5 TM (avoids L7 SLC-off scan-line gaps)
  '2013': { collection: 'LANDSAT/LC08/C02/T1_L2', nir: 'SR_B5', red: 'SR_B4' }, // L8 OLI
  '2023': { collection: 'LANDSAT/LC08/C02/T1_L2', nir: 'SR_B5', red: 'SR_B4' }, // L8 OLI
};

// ── Export NDVI for each year ─────────────────────────────────────────────────
var ndviYears = ['1993', '2003', '2013', '2023'];

ndviYears.forEach(function(year) {
  var cfg = landsatConfig[year];
  var col = ee.ImageCollection(cfg.collection)
    .filterBounds(roi)
    .filter(ee.Filter.calendarRange(parseInt(year), parseInt(year), 'year'))
    .filter(ee.Filter.calendarRange(6, 8, 'month'))  // dry season Jun–Aug
    .map(maskL2sr)
    .map(scaleReflectance);

  var ndvi = col
    .map(function(img) { return computeNDVI(img, cfg.nir, cfg.red); })
    .median()
    .clip(roi);

  Export.image.toDrive({
    image: ndvi,
    description: 'ndvi_' + year,
    folder: 'bauru_webgis',
    fileNamePrefix: 'ndvi_' + year,
    region: roi,
    scale: 30,
    crs: 'EPSG:4326',
    maxPixels: 1e9,
    fileFormat: 'GeoTIFF',
  });
});

// ── Export LST from MODIS MOD11A2 (2003, 2013, 2023) ─────────────────────────
// MOD11A2: 8-day composite, LST_Day_1km band
// Scale factor: 0.02 → Kelvin; subtract 273.15 → Celsius
var lstYears = ['2003', '2013', '2023'];

lstYears.forEach(function(year) {
  var startDate = year + '-06-01';
  var endDate   = year + '-08-31';

  var lst = ee.ImageCollection('MODIS/061/MOD11A2')
    .filterBounds(roi)
    .filterDate(startDate, endDate)
    .select('LST_Day_1km')
    .mean()                      // mean across dry-season composites
    .multiply(0.02)              // DN → Kelvin
    .subtract(273.15)            // Kelvin → Celsius
    .rename('LST_C')
    .clip(roi);

  Export.image.toDrive({
    image: lst,
    description: 'lst_' + year,
    folder: 'bauru_webgis',
    fileNamePrefix: 'lst_' + year,
    region: roi,
    scale: 1000,
    crs: 'EPSG:4326',
    maxPixels: 1e9,
    fileFormat: 'GeoTIFF',
  });
});

print('Tasks queued: ndvi_1993, ndvi_2003, ndvi_2013, ndvi_2023, lst_2003, lst_2013, lst_2023');
print('Go to the Tasks tab and click Run on each one.');
