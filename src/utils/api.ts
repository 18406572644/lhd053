const BASE = '/api'

export async function fetchTickets(params: {
  page?: number; pageSize?: number; line?: string; type?: string; startDate?: string; endDate?: string; keyword?: string
}): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.line) query.set('line', params.line)
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  if (params.keyword) query.set('keyword', params.keyword)
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
  page?: number; pageSize?: number; line?: string; type?: string; startDate?: string; endDate?: string; favorite?: string; ticketId?: number | 'null'; keyword?: string
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

export async function fetchStatsOverview() {
  const res = await fetch(`${BASE}/stats/overview`)
  return res.json()
}

export async function fetchStatsByPeriod(period: string, startDate?: string, endDate?: string) {
  const query = new URLSearchParams({ period })
  if (startDate) query.set('startDate', startDate)
  if (endDate) query.set('endDate', endDate)
  const res = await fetch(`${BASE}/stats/by-period?${query}`)
  return res.json()
}

export async function fetchTopLines(limit?: number) {
  const query = new URLSearchParams()
  if (limit) query.set('limit', String(limit))
  const res = await fetch(`${BASE}/stats/top-lines?${query}`)
  return res.json()
}

export async function fetchDurationDistribution() {
  const res = await fetch(`${BASE}/stats/duration-distribution`)
  return res.json()
}

export async function fetchLineHeatmap() {
  const res = await fetch(`${BASE}/stats/line-heatmap`)
  return res.json()
}

export async function fetchPeriodComparison(period?: string) {
  const query = new URLSearchParams()
  if (period) query.set('period', period)
  const res = await fetch(`${BASE}/stats/period-comparison?${query}`)
  return res.json()
}

export async function fetchStationHeatmap() {
  const res = await fetch(`${BASE}/stats/station-heatmap`)
  return res.json()
}

export async function fetchSegmentHeatmap() {
  const res = await fetch(`${BASE}/stats/segment-heatmap`)
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
}) {
  const query = new URLSearchParams()
  query.set('format', params.format)
  if (params.line) query.set('line', params.line)
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.favorite) query.set('favorite', params.favorite)

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
