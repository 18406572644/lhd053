import { Router } from 'express'
import { db } from '../database.js'
import type { Trip } from '../types.js'

export const exportRouter = Router()

function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as number,
    ticketId: row.ticket_id as number | null,
    ticket: row.ticket_id ? {
      id: row.ticket_id as number,
      imageUrl: row.ticket_image_url as string,
      line: row.ticket_line as string,
      startStation: row.ticket_start_station as string,
      endStation: row.ticket_end_station as string,
      type: row.ticket_type as 'bus' | 'metro',
      travelDate: row.ticket_travel_date as string,
    } : null,
    line: row.line as string,
    startStation: row.start_station as string,
    endStation: row.end_station as string,
    type: row.type as 'bus' | 'metro',
    travelDate: row.travel_date as string,
    duration: row.duration as number,
    notes: row.notes as string,
    favorite: Boolean(row.favorite),
    city: row.city as string,
    createdAt: row.created_at as string,
  }
}

function buildWhereClauses(req: any): { where: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[] = []

  if (req.query.city) {
    conditions.push('trips.city = ?')
    params.push(req.query.city)
  }
  if (req.query.keyword) {
    const keyword = `%${req.query.keyword}%`
    conditions.push('(trips.start_station LIKE ? OR trips.end_station LIKE ? OR trips.notes LIKE ?)')
    params.push(keyword, keyword, keyword)
  }
  if (req.query.line) {
    conditions.push('trips.line = ?')
    params.push(req.query.line)
  }
  if (req.query.type) {
    conditions.push('trips.type = ?')
    params.push(req.query.type)
  }
  if (req.query.startDate) {
    conditions.push('trips.travel_date >= ?')
    params.push(req.query.startDate)
  }
  if (req.query.endDate) {
    conditions.push('trips.travel_date <= ?')
    params.push(req.query.endDate)
  }
  if (req.query.favorite !== undefined) {
    conditions.push('trips.favorite = ?')
    params.push(req.query.favorite === 'true' || req.query.favorite === '1' ? 1 : 0)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  return { where, params }
}

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function tripsToCsv(trips: Trip[]): string {
  const headers = [
    'ID',
    '票根ID',
    '线路',
    '起始站',
    '终点站',
    '类型',
    '出行日期',
    '时长(分钟)',
    '备注',
    '收藏',
    '创建时间',
    '票根图片URL',
    '票根线路',
    '票根起始站',
    '票根终点站',
    '票根类型',
    '票根出行日期',
  ]

  const rows = trips.map(trip => [
    trip.id,
    trip.ticketId ?? '',
    trip.line,
    trip.startStation,
    trip.endStation,
    trip.type === 'bus' ? '公交' : '地铁',
    trip.travelDate,
    trip.duration,
    trip.notes,
    trip.favorite ? '是' : '否',
    trip.createdAt,
    trip.ticket?.imageUrl ?? '',
    trip.ticket?.line ?? '',
    trip.ticket?.startStation ?? '',
    trip.ticket?.endStation ?? '',
    trip.ticket ? (trip.ticket.type === 'bus' ? '公交' : '地铁') : '',
    trip.ticket?.travelDate ?? '',
  ])

  const csvLines = [
    headers.map(escapeCsvField).join(','),
    ...rows.map(row => row.map(escapeCsvField).join(',')),
  ]

  return '\uFEFF' + csvLines.join('\r\n')
}

exportRouter.get('/', (req, res) => {
  const format = (req.query.format as string) || 'json'

  if (format !== 'csv' && format !== 'json') {
    res.status(400).json({ error: 'Invalid format. Must be "csv" or "json".' })
    return
  }

  const { where, params } = buildWhereClauses(req)

  const rows = db.prepare(`
    SELECT trips.*,
      tickets.image_url AS ticket_image_url,
      tickets.line AS ticket_line,
      tickets.start_station AS ticket_start_station,
      tickets.end_station AS ticket_end_station,
      tickets.type AS ticket_type,
      tickets.travel_date AS ticket_travel_date
    FROM trips
    LEFT JOIN tickets ON trips.ticket_id = tickets.id
    ${where}
    ORDER BY trips.created_at DESC
  `).all(...params) as Record<string, unknown>[]

  const trips = rows.map(mapTrip)
  const timestamp = new Date().toISOString().slice(0, 10)

  if (format === 'csv') {
    const csv = tripsToCsv(trips)
    const filename = `trips_${timestamp}.csv`
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  } else {
    const filename = `trips_${timestamp}.json`
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.json(trips)
  }
})
