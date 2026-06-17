const BASE = '/api'

export async function fetchTickets(params: {
  page?: number; pageSize?: number; line?: string; type?: string; startDate?: string; endDate?: string
}): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.line) query.set('line', params.line)
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
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
  page?: number; pageSize?: number; line?: string; type?: string; startDate?: string; endDate?: string; favorite?: string
}): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.line) query.set('line', params.line)
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  if (params.favorite) query.set('favorite', params.favorite)
  const res = await fetch(`${BASE}/trips?${query}`)
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
