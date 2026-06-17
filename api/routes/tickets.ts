import { Router } from 'express'
import { db } from '../database.js'
import type { Ticket, PaginatedResponse } from '../types.js'

export const ticketsRouter = Router()

function mapTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as number,
    imageUrl: row.image_url as string,
    line: row.line as string,
    startStation: row.start_station as string,
    endStation: row.end_station as string,
    type: row.type as 'bus' | 'metro',
    travelDate: row.travel_date as string,
    notes: row.notes as string,
    city: row.city as string,
    createdAt: row.created_at as string,
  }
}

ticketsRouter.get('/', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 10))
  const offset = (page - 1) * pageSize

  const conditions: string[] = []
  const params: unknown[] = []

  if (req.query.city) {
    conditions.push('city = ?')
    params.push(req.query.city)
  }
  if (req.query.keyword) {
    const keyword = `%${req.query.keyword}%`
    conditions.push('(start_station LIKE ? OR end_station LIKE ? OR notes LIKE ?)')
    params.push(keyword, keyword, keyword)
  }
  if (req.query.line) {
    conditions.push('line = ?')
    params.push(req.query.line)
  }
  if (req.query.type) {
    conditions.push('type = ?')
    params.push(req.query.type)
  }
  if (req.query.startDate) {
    conditions.push('travel_date >= ?')
    params.push(req.query.startDate)
  }
  if (req.query.endDate) {
    conditions.push('travel_date <= ?')
    params.push(req.query.endDate)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const total = (db.prepare(`SELECT COUNT(*) as count FROM tickets ${where}`).get(...params) as { count: number }).count
  const rows = db.prepare(`SELECT * FROM tickets ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as Record<string, unknown>[]

  const response: PaginatedResponse<Ticket> = {
    data: rows.map(mapTicket),
    total,
    page,
    pageSize,
  }
  res.json(response)
})

ticketsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
  if (!row) {
    res.status(404).json({ error: 'Ticket not found' })
    return
  }
  res.json(mapTicket(row))
})

ticketsRouter.post('/', (req, res) => {
  const { line, startStation, endStation, type, travelDate, notes, city } = req.body
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : ''
  const cityValue = city || 'beijing'

  const result = db.prepare(`
    INSERT INTO tickets (image_url, line, start_station, end_station, type, travel_date, notes, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(imageUrl, line, startStation, endStation, type, travelDate, notes || '', cityValue)

  const ticketId = Number(result.lastInsertRowid)

  db.prepare(`
    INSERT INTO trips (ticket_id, line, start_station, end_station, type, travel_date, duration, notes, favorite, city)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0, ?)
  `).run(ticketId, line, startStation, endStation, type, travelDate, notes || '', cityValue)

  const row = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId) as Record<string, unknown>
  res.status(201).json(mapTicket(row))
})

ticketsRouter.put('/:id', (req, res) => {
  const { line, startStation, endStation, type, travelDate, notes, city } = req.body
  const id = req.params.id

  const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) {
    res.status(404).json({ error: 'Ticket not found' })
    return
  }

  db.prepare(`
    UPDATE tickets SET line = ?, start_station = ?, end_station = ?, type = ?, travel_date = ?, notes = ?, city = ?
    WHERE id = ?
  `).run(
    line ?? existing.line,
    startStation ?? existing.start_station,
    endStation ?? existing.end_station,
    type ?? existing.type,
    travelDate ?? existing.travel_date,
    notes ?? existing.notes,
    city ?? existing.city,
    id
  )

  db.prepare(`
    UPDATE trips SET line = ?, start_station = ?, end_station = ?, type = ?, travel_date = ?, notes = ?, city = ?
    WHERE ticket_id = ?
  `).run(
    line ?? existing.line,
    startStation ?? existing.start_station,
    endStation ?? existing.end_station,
    type ?? existing.type,
    travelDate ?? existing.travel_date,
    notes ?? existing.notes,
    city ?? existing.city,
    id
  )

  const row = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Record<string, unknown>
  res.json(mapTicket(row))
})

ticketsRouter.delete('/:id', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) {
    res.status(404).json({ error: 'Ticket not found' })
    return
  }

  db.prepare('DELETE FROM trips WHERE ticket_id = ?').run(id)
  db.prepare('DELETE FROM tickets WHERE id = ?').run(id)
  res.status(204).end()
})
