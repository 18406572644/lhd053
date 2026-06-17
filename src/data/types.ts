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
