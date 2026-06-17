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

statsRouter.get('/duration-distribution', (_req, res) => {
  const rows = db.prepare(`
    SELECT type, COALESCE(SUM(duration), 0) as totalDuration, COUNT(*) as tripCount
    FROM trips
    GROUP BY type
  `).all() as { type: string; totalDuration: number; tripCount: number }[]

  const result: Record<string, { duration: number; count: number }> = {}
  for (const row of rows) {
    result[row.type] = {
      duration: row.totalDuration,
      count: row.tripCount,
    }
  }

  res.json({
    bus: result.bus || { duration: 0, count: 0 },
    metro: result.metro || { duration: 0, count: 0 },
  })
})

statsRouter.get('/line-heatmap', (_req, res) => {
  const rows = db.prepare(`
    SELECT 
      line, 
      type,
      COUNT(*) as tripCount, 
      COALESCE(SUM(duration), 0) as totalDuration,
      COALESCE(AVG(duration), 0) as avgDuration
    FROM trips
    GROUP BY line, type
    ORDER BY tripCount DESC
  `).all() as { 
    line: string; 
    type: string; 
    tripCount: number; 
    totalDuration: number; 
    avgDuration: number 
  }[]

  res.json(rows)
})

statsRouter.get('/period-comparison', (req, res) => {
  const period = (req.query.period as string) || 'week'

  let dateFormat: string
  let intervalCount: number
  switch (period) {
    case 'week':
      dateFormat = '%Y-W%W'
      intervalCount = 2
      break
    case 'month':
      dateFormat = '%Y-%m'
      intervalCount = 2
      break
    default:
      dateFormat = '%Y-%m-%d'
      intervalCount = 7
  }

  const rows = db.prepare(`
    SELECT 
      strftime('${dateFormat}', travel_date) as label, 
      COUNT(*) as count, 
      COALESCE(SUM(duration), 0) as duration
    FROM trips
    GROUP BY label
    ORDER BY label DESC
    LIMIT ?
  `).all(intervalCount) as { label: string; count: number; duration: number }[]

  const sorted = rows.reverse()

  if (sorted.length < 2) {
    res.json({
      current: sorted[0] || { label: '', count: 0, duration: 0 },
      previous: { label: '', count: 0, duration: 0 },
      countChange: 0,
      durationChange: 0,
    })
    return
  }

  const current = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]

  const countChange = previous.count > 0
    ? ((current.count - previous.count) / previous.count) * 100
    : current.count > 0 ? 100 : 0

  const durationChange = previous.duration > 0
    ? ((current.duration - previous.duration) / previous.duration) * 100
    : current.duration > 0 ? 100 : 0

  res.json({
    current,
    previous,
    countChange: Math.round(countChange * 10) / 10,
    durationChange: Math.round(durationChange * 10) / 10,
  })
})
