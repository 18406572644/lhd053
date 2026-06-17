import { Router } from 'express'
import { db } from '../database.js'

export const statsRouter = Router()

statsRouter.get('/overview', (_req, res) => {
  const totalTrips = (db.prepare('SELECT COUNT(*) as count FROM trips').get() as { count: number }).count
  const totalDuration = (db.prepare('SELECT COALESCE(SUM(duration), 0) as total FROM trips').get() as { total: number }).total
  const favoriteCount = (db.prepare('SELECT COUNT(*) as count FROM trips WHERE favorite = 1').get() as { count: number }).count
  const lineCount = (db.prepare('SELECT COUNT(DISTINCT line) as count FROM trips').get() as { count: number }).count

  res.json({
    totalTrips,
    totalDuration,
    favoriteCount,
    lineCount,
  })
})

statsRouter.get('/by-period', (req, res) => {
  const period = (req.query.period as string) || 'day'
  const startDate = req.query.startDate as string | undefined
  const endDate = req.query.endDate as string | undefined

  const conditions: string[] = []
  const params: unknown[] = []

  if (startDate) {
    conditions.push('travel_date >= ?')
    params.push(startDate)
  }
  if (endDate) {
    conditions.push('travel_date <= ?')
    params.push(endDate)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  let dateFormat: string
  switch (period) {
    case 'week':
      dateFormat = '%Y-W%W'
      break
    case 'month':
      dateFormat = '%Y-%m'
      break
    default:
      dateFormat = '%Y-%m-%d'
  }

  const rows = db.prepare(`
    SELECT strftime('${dateFormat}', travel_date) as label, COUNT(*) as count, COALESCE(SUM(duration), 0) as duration
    FROM trips ${where}
    GROUP BY label
    ORDER BY label
  `).all(...params) as { label: string; count: number; duration: number }[]

  res.json({
    labels: rows.map(r => r.label),
    counts: rows.map(r => r.count),
    durations: rows.map(r => r.duration),
  })
})

statsRouter.get('/top-lines', (req, res) => {
  const limit = Math.max(1, Number(req.query.limit) || 5)

  const rows = db.prepare(`
    SELECT line, COUNT(*) as count
    FROM trips
    GROUP BY line
    ORDER BY count DESC
    LIMIT ?
  `).all(limit) as { line: string; count: number }[]

  res.json(rows)
})
