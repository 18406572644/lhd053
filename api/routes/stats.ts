import { Router } from 'express'
import { db } from '../database.js'
import { getStationCoords, findLineByStation, getRouteStations } from '../subwayData.js'

export const statsRouter = Router()

statsRouter.get('/overview', (req, res) => {
  const city = (req.query.city as string) || 'beijing'
  
  const totalTrips = (db.prepare('SELECT COUNT(*) as count FROM trips WHERE city = ?').get(city) as { count: number }).count
  const totalDuration = (db.prepare('SELECT COALESCE(SUM(duration), 0) as total FROM trips WHERE city = ?').get(city) as { total: number }).total
  const favoriteCount = (db.prepare('SELECT COUNT(*) as count FROM trips WHERE favorite = 1 AND city = ?').get(city) as { count: number }).count
  const lineCount = (db.prepare('SELECT COUNT(DISTINCT line) as count FROM trips WHERE city = ?').get(city) as { count: number }).count

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
  const city = (req.query.city as string) || 'beijing'

  const conditions: string[] = ['city = ?']
  const params: unknown[] = [city]

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
  const city = (req.query.city as string) || 'beijing'

  const rows = db.prepare(`
    SELECT line, COUNT(*) as count
    FROM trips
    WHERE city = ?
    GROUP BY line
    ORDER BY count DESC
    LIMIT ?
  `).all(city, limit) as { line: string; count: number }[]

  res.json(rows)
})

statsRouter.get('/duration-distribution', (req, res) => {
  const city = (req.query.city as string) || 'beijing'
  
  const rows = db.prepare(`
    SELECT type, COALESCE(SUM(duration), 0) as totalDuration, COUNT(*) as tripCount
    FROM trips
    WHERE city = ?
    GROUP BY type
  `).all(city) as { type: string; totalDuration: number; tripCount: number }[]

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

statsRouter.get('/line-heatmap', (req, res) => {
  const city = (req.query.city as string) || 'beijing'
  
  const rows = db.prepare(`
    SELECT 
      line, 
      type,
      COUNT(*) as tripCount, 
      COALESCE(SUM(duration), 0) as totalDuration,
      COALESCE(AVG(duration), 0) as avgDuration
    FROM trips
    WHERE city = ?
    GROUP BY line, type
    ORDER BY tripCount DESC
  `).all(city) as { 
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
  const city = (req.query.city as string) || 'beijing'

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
    WHERE city = ?
    GROUP BY label
    ORDER BY label DESC
    LIMIT ?
  `).all(city, intervalCount) as { label: string; count: number; duration: number }[]

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

statsRouter.get('/station-heatmap', (req, res) => {
  const cityId = (req.query.city as string) || 'beijing'
  const stationCountMap: Record<string, number> = {}

  const rows = db.prepare(`
    SELECT start_station, end_station
    FROM trips
    WHERE type = 'metro' AND city = ?
  `).all(cityId) as { start_station: string; end_station: string }[]

  for (const row of rows) {
    if (row.start_station) {
      stationCountMap[row.start_station] = (stationCountMap[row.start_station] || 0) + 1
    }
    if (row.end_station) {
      stationCountMap[row.end_station] = (stationCountMap[row.end_station] || 0) + 1
    }
  }

  const result: Array<{ station: string; lat: number; lng: number; count: number }> = []
  for (const [station, count] of Object.entries(stationCountMap)) {
    const coords = getStationCoords(station, cityId)
    if (coords) {
      result.push({
        station,
        lat: coords.lat,
        lng: coords.lng,
        count,
      })
    }
  }

  result.sort((a, b) => b.count - a.count)
  res.json(result)
})

statsRouter.get('/segment-heatmap', (req, res) => {
  const cityId = (req.query.city as string) || 'beijing'
  const segmentMap: Record<string, { from: string; to: string; line: string; count: number }> = {}

  const rows = db.prepare(`
    SELECT line, start_station, end_station, COUNT(*) as count
    FROM trips
    WHERE type = 'metro' AND start_station IS NOT NULL AND end_station IS NOT NULL AND city = ?
    GROUP BY line, start_station, end_station
    ORDER BY count DESC
  `).all(cityId) as { line: string; start_station: string; end_station: string; count: number }[]

  for (const row of rows) {
    const key = `${row.line}|${row.start_station}|${row.end_station}`
    const reverseKey = `${row.line}|${row.end_station}|${row.start_station}`

    if (segmentMap[reverseKey]) {
      segmentMap[reverseKey].count += row.count
    } else {
      segmentMap[key] = {
        from: row.start_station,
        to: row.end_station,
        line: row.line,
        count: row.count,
      }
    }
  }

  const result = Object.values(segmentMap).sort((a, b) => b.count - a.count)

  const enriched = result.map(seg => {
    const line = findLineByStation(seg.from, seg.to, cityId)
    const stations = line ? getRouteStations(line, seg.from, seg.to) : []
    return {
      ...seg,
      color: line?.color || '#F44336',
      stations: stations.map(s => ({ name: s.name, lat: s.lat, lng: s.lng })),
    }
  })

  res.json(enriched)
})
