const BASE = '/api'

export async function fetchTickets(params: {
  page?: number; pageSize?: number; line?: string; type?: string; startDate?: string; endDate?: string; keyword?: string; city?: string
}): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.line) query.set('line', params.line)
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.city) query.set('city', params.city)
  const res = await fetch(`${BASE}/tickets?${query}`)
  return res.json()
}

export async function uploadTicket(formData: FormData) {
  const res = await fetch(`${BASE}/tickets`, { method: 'POST', body: formData })
  return res.json()
}

export async function deleteTicket(id: number) {
  const res = await fetch(`${BASE}/tickets/${id}`, { method: 'DELETE' })
  return res.json()
}

export async function fetchTrips(params: {
  page?: number; pageSize?: number; line?: string; type?: string; startDate?: string; endDate?: string; favorite?: string; ticketId?: number | 'null'; keyword?: string; city?: string
}): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.line) query.set('line', params.line)
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  if (params.favorite) query.set('favorite', params.favorite)
  if (params.ticketId !== undefined) query.set('ticketId', String(params.ticketId))
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.city) query.set('city', params.city)
  const res = await fetch(`${BASE}/trips?${query}`)
  return res.json()
}

export async function fetchTicketById(id: number): Promise<any> {
  const res = await fetch(`${BASE}/tickets/${id}`)
  return res.json()
}

export async function createTrip(data: Record<string, any>) {
  const res = await fetch(`${BASE}/trips`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  return res.json()
}

export async function toggleFavorite(id: number) {
  const res = await fetch(`${BASE}/trips/${id}/favorite`, { method: 'PUT' })
  return res.json()
}

export async function deleteTrip(id: number) {
  const res = await fetch(`${BASE}/trips/${id}`, { method: 'DELETE' })
  return res.json()
}

export async function fetchStatsOverview(city?: string) {
  const query = new URLSearchParams()
  if (city) query.set('city', city)
  const res = await fetch(`${BASE}/stats/overview?${query}`)
  return res.json()
}

export async function fetchStatsByPeriod(period: string, startDate?: string, endDate?: string, city?: string) {
  const query = new URLSearchParams({ period })
  if (startDate) query.set('startDate', startDate)
  if (endDate) query.set('endDate', endDate)
  if (city) query.set('city', city)
  const res = await fetch(`${BASE}/stats/by-period?${query}`)
  return res.json()
}

export async function fetchTopLines(limit?: number, city?: string) {
  const query = new URLSearchParams()
  if (limit) query.set('limit', String(limit))
  if (city) query.set('city', city)
  const res = await fetch(`${BASE}/stats/top-lines?${query}`)
  return res.json()
}

export async function fetchDurationDistribution(city?: string) {
  const query = new URLSearchParams()
  if (city) query.set('city', city)
  const res = await fetch(`${BASE}/stats/duration-distribution?${query}`)
  return res.json()
}

export async function fetchLineHeatmap(city?: string) {
  const query = new URLSearchParams()
  if (city) query.set('city', city)
  const res = await fetch(`${BASE}/stats/line-heatmap?${query}`)
  return res.json()
}

export async function fetchPeriodComparison(period?: string, city?: string) {
  const query = new URLSearchParams()
  if (period) query.set('period', period)
  if (city) query.set('city', city)
  const res = await fetch(`${BASE}/stats/period-comparison?${query}`)
  return res.json()
}

export async function fetchStationHeatmap(cityId?: string) {
  const query = new URLSearchParams()
  if (cityId) query.set('city', cityId)
  const res = await fetch(`${BASE}/stats/station-heatmap?${query}`)
  return res.json()
}

export async function fetchSegmentHeatmap(cityId?: string) {
  const query = new URLSearchParams()
  if (cityId) query.set('city', cityId)
  const res = await fetch(`${BASE}/stats/segment-heatmap?${query}`)
  return res.json()
}

export async function exportTrips(params: {
  format: 'csv' | 'json';
  line?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  favorite?: string;
  city?: string;
}) {
  const query = new URLSearchParams()
  query.set('format', params.format)
  if (params.line) query.set('line', params.line)
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.favorite) query.set('favorite', params.favorite)
  if (params.city) query.set('city', params.city)

  const res = await fetch(`${BASE}/export?${query}`)
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  let filename = `trips_${new Date().toISOString().slice(0, 10)}.${params.format}`
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/)
    if (match) filename = match[1]
  }
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function ocrRecognize(imageFile: File): Promise<{
  success: boolean
  rawText: string
  parsed: {
    line: string
    startStation: string
    endStation: string
    type: 'bus' | 'metro'
    travelDate: string
  }
}> {
  const formData = new FormData()
  formData.append('image', imageFile)
  const res = await fetch(`${BASE}/ocr/recognize`, {
    method: 'POST',
    body: formData,
  })
  return res.json()
}

export async function fetchCities(): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(`${BASE}/cities`)
  return res.json()
}

export async function fetchCityLines(cityId: string): Promise<{
  id: string
  name: string
  center: { lat: number; lng: number }
  zoom: number
  lineColors: Record<string, string>
  lines: Array<{
    name: string
    color: string
    stations: Array<{ name: string; lat: number; lng: number }>
  }>
}> {
  const res = await fetch(`${BASE}/cities/${cityId}/lines`)
  return res.json()
}
