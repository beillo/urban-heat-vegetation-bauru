/**
 * GEE Script B — MapBiomas LULC exports for Bauru, SP
 *
 * Paste this script into code.earthengine.google.com and click Run.
 * Each Export task must be started manually in the Tasks panel.
 *
 * Source: MapBiomas Collection 9 integration mosaic
 * Output folder in Google Drive: bauru_webgis
 * Files: lulc_1993, lulc_2003, lulc_2013, lulc_2023
 *
 * After download: run scripts/convert_to_cog.sh to convert to COG format.
 *
 * MapBiomas class IDs used in color rendering (see src/utils/colorScales.js):
 *   3  = Forest Formation
 *   4  = Savanna Formation
 *  12  = Grassland
 *  15  = Pasture
 *  18  = Agriculture
 *  21  = Mosaic of Uses
 *  24  = Urban Area
 *  33  = Water
 */

// ── Study area ────────────────────────────────────────────────────────────────
var roi = ee.Geometry.Rectangle([-49.55, -22.85, -48.75, -21.95]); // W S E N

// ── MapBiomas Collection 9 asset ──────────────────────────────────────────────
var MAPBIOMAS_ASSET =
  'projects/mapbiomas-public/assets/brazil/lulc/collection9/' +
  'mapbiomas_collection90_integration_v1';

var mosaic = ee.Image(MAPBIOMAS_ASSET);

// ── Export each year ──────────────────────────────────────────────────────────
var years = [1993, 2003, 2013, 2023];

years.forEach(function(year) {
  var bandName = 'classification_' + year;

  // Verify band exists (prints in Console — useful for debugging)
  print('Exporting band: ' + bandName);

  var lulc = mosaic
    .select(bandName)
    .rename('lulc')
    .clip(roi);

  Export.image.toDrive({
    image: lulc,
    description: 'lulc_' + year,
    folder: 'bauru_webgis',
    fileNamePrefix: 'lulc_' + year,
    region: roi,
    scale: 30,                   // Landsat-equivalent resolution
    crs: 'EPSG:4326',
    maxPixels: 1e9,
    fileFormat: 'GeoTIFF',
  });
});

print('Tasks queued: lulc_1993, lulc_2003, lulc_2013, lulc_2023');
print('Go to the Tasks tab and click Run on each one.');
