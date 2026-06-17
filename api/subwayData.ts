import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface Station {
  name: string
  lat: number
  lng: number
}

export interface SubwayLine {
  name: string
  color: string
  stations: Station[]
}

export interface CityCenter {
  lat: number
  lng: number
}

export interface CityData {
  id: string
  name: string
  center: CityCenter
  zoom: number
  lineColors: Record<string, string>
  lines: SubwayLine[]
}

export interface CityInfo {
  id: string
  name: string
}

function loadCityData(cityId: string): CityData | null {
  const filePath = path.join(__dirname, 'data', 'cities', `${cityId}.json`)
  if (!fs.existsSync(filePath)) {
    return null
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content) as CityData
}

export function getCities(): CityInfo[] {
  const indexPath = path.join(__dirname, 'data', 'cities', 'index.json')
  if (!fs.existsSync(indexPath)) {
    return [{ id: 'beijing', name: '北京' }]
  }
  const content = fs.readFileSync(indexPath, 'utf-8')
  return JSON.parse(content) as CityInfo[]
}

export function getCityData(cityId: string): CityData {
  const data = loadCityData(cityId)
  if (!data) {
    return loadCityData('beijing')!
  }
  return data
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
