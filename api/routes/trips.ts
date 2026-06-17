import { Router } from 'express'
import { db } from '../database.js'
import type { Trip, PaginatedResponse } from '../types.js'

export const tripsRouter = Router()

function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as number,
    ticketId: row.ticket_id as number | null,
    line: row.line as string,
    startStation: row.start_station as string,
    endStation: row.end_station as string,
    type: row.type as 'bus' | 'metro',
    travelDate: row.travel_date as string,
    duration: row.duration as number,
    notes: row.notes as string,
    favorite: Boolean(row.favorite),
    createdAt: row.created_at as string,
  }
}

tripsRouter.get('/', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 10))
  const offset = (page - 1) * pageSize

  const conditions: string[] = []
  const params: unknown[] = []

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
  if (req.query.favorite !== undefined) {
    conditions.push('favorite = ?')
    params.push(req.query.favorite === 'true' || req.query.favorite === '1' ? 1 : 0)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const total = (db.prepare(`SELECT COUNT(*) as count FROM trips ${where}`).get(...params) as { count: number }).count
  const rows = db.prepare(`SELECT * FROM trips ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as Record<string, unknown>[]

  const response: PaginatedResponse<Trip> = {
    data: rows.map(mapTrip),
    total,
    page,
    pageSize,
  }
  res.json(response)
})

tripsRouter.post('/', (req, res) => {
  const { line, startStation, endStation, type, travelDate, duration, notes } = req.body

  const result = db.prepare(`
    INSERT INTO trips (ticket_id, line, start_station, end_station, type, travel_date, duration, notes, favorite)
    VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(line, startStation, endStation, type, travelDate, duration || 0, notes || '')

  const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<string, unknown>
  res.status(201).json(mapTrip(row))
})

tripsRouter.put('/:id/favorite', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) {
    res.status(404).json({ error: 'Trip not found' })
    return
  }

  const newFavorite = existing.favorite ? 0 : 1
  db.prepare('UPDATE trips SET favorite = ? WHERE id = ?').run(newFavorite, id)

  const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(id) as Record<string, unknown>
  res.json(mapTrip(row))
})

tripsRouter.delete('/:id', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) {
    res.status(404).json({ error: 'Trip not found' })
    return
  }

  db.prepare('DELETE FROM trips WHERE id = ?').run(id)
  res.status(204).end()
})
