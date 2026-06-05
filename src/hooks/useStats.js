import statsData from '../data/stats.json'

export function useStats(year) {
  return statsData[year] ?? null
}

export function useAllStats() {
  return statsData
}
