import beijingData from './cities/beijing.json'
import shanghaiData from './cities/shanghai.json'
import citiesIndex from './cities/index.json'
import type { Station, SubwayLine, CityData, CityInfo, CityCenter } from './types'

export type { Station, SubwayLine, CityData, CityInfo, CityCenter }

const cityDataMap: Record<string, CityData> = {
  beijing: beijingData as CityData,
  shanghai: shanghaiData as CityData,
}

export const cities: CityInfo[] = citiesIndex as CityInfo[]

export function getCityData(cityId: string): CityData {
  return cityDataMap[cityId] || cityDataMap.beijing
}

export function getSubwayLines(cityId: string): SubwayLine[] {
  return getCityData(cityId).lines
}

export function getLineColors(cityId: string): Record<string, string> {
  return getCityData(cityId).lineColors
}

export function getCityCenter(cityId: string): CityCenter {
  return getCityData(cityId).center
}

export function getCityZoom(cityId: string): number {
  return getCityData(cityId).zoom
}

export function getStationCoords(
  stationName: string,
  cityId: string,
): { lat: number; lng: number } | null {
  const cityData = getCityData(cityId)
  for (const line of cityData.lines) {
    for (const station of line.stations) {
      if (station.name === stationName) {
        return { lat: station.lat, lng: station.lng }
      }
    }
  }
  return null
}

export function getLineColor(lineName: string, cityId: string): string {
  const lineColors = getLineColors(cityId)
  return lineColors[lineName] || '#1A5CD6'
}

export function findLineByStation(
  start: string,
  end: string,
  cityId: string,
): SubwayLine | null {
  const lines = getSubwayLines(cityId)
  for (const line of lines) {
    const startIdx = line.stations.findIndex((s) => s.name === start)
    const endIdx = line.stations.findIndex((s) => s.name === end)
    if (startIdx !== -1 && endIdx !== -1) {
      return line
    }
  }
  return null
}

export function getRouteStations(
  line: SubwayLine,
  start: string,
  end: string,
): Station[] {
  const startIdx = line.stations.findIndex((s) => s.name === start)
  const endIdx = line.stations.findIndex((s) => s.name === end)
  if (startIdx === -1 || endIdx === -1) return []

  const minIdx = Math.min(startIdx, endIdx)
  const maxIdx = Math.max(startIdx, endIdx)
  return line.stations.slice(minIdx, maxIdx + 1)
}
