export function removeMapLayer(map, sourceId, layerId) {
  if (!map) return
  if (map.getLayer(layerId)) map.removeLayer(layerId)
  if (map.getSource(sourceId)) map.removeSource(sourceId)
}
