import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'transit.db')

export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    line TEXT NOT NULL,
    start_station TEXT NOT NULL,
    end_station TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('bus', 'metro')),
    travel_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER,
    line TEXT NOT NULL,
    start_station TEXT NOT NULL,
    end_station TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('bus', 'metro')),
    travel_date TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tickets_line ON tickets(line);
  CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type);
  CREATE INDEX IF NOT EXISTS idx_tickets_travel_date ON tickets(travel_date);

  CREATE INDEX IF NOT EXISTS idx_trips_line ON trips(line);
  CREATE INDEX IF NOT EXISTS idx_trips_type ON trips(type);
  CREATE INDEX IF NOT EXISTS idx_trips_travel_date ON trips(travel_date);
  CREATE INDEX IF NOT EXISTS idx_trips_favorite ON trips(favorite);
  CREATE INDEX IF NOT EXISTS idx_trips_ticket_id ON trips(ticket_id);
`)

const ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number }

if (ticketCount.count === 0) {
  const insertTicket = db.prepare(`
    INSERT INTO tickets (image_url, line, start_station, end_station, type, travel_date, notes)
    VALUES (@imageUrl, @line, @startStation, @endStation, @type, @travelDate, @notes)
  `)

  const insertTrip = db.prepare(`
    INSERT INTO trips (ticket_id, line, start_station, end_station, type, travel_date, duration, notes, favorite)
    VALUES (@ticketId, @line, @startStation, @endStation, @type, @travelDate, @duration, @notes, @favorite)
  `)

  const seedData = db.transaction(() => {
    const tickets = [
      { imageUrl: '/uploads/ticket1.jpg', line: '1号线', startStation: '天安门东', endStation: '西直门', type: 'metro', travelDate: '2026-01-05', notes: '早高峰出行' },
      { imageUrl: '/uploads/ticket2.jpg', line: '2号线', startStation: '西直门', endStation: '国贸', type: 'metro', travelDate: '2026-01-07', notes: '' },
      { imageUrl: '/uploads/ticket3.jpg', line: '10号线', startStation: '国贸', endStation: '知春路', type: 'metro', travelDate: '2026-01-10', notes: '换乘方便' },
      { imageUrl: '/uploads/ticket4.jpg', line: '1号线', startStation: '王府井', endStation: '天安门东', type: 'metro', travelDate: '2026-01-12', notes: '短途' },
      { imageUrl: '/uploads/ticket5.jpg', line: '13号线', startStation: '知春路', endStation: '西二旗', type: 'metro', travelDate: '2026-02-01', notes: '上班通勤' },
      { imageUrl: '/uploads/ticket6.jpg', line: '4号线', startStation: '西直门', endStation: '北京南站', type: 'metro', travelDate: '2026-02-05', notes: '赶火车' },
      { imageUrl: '/uploads/ticket7.jpg', line: '公交52路', startStation: '天安门东', endStation: '菜市口', type: 'bus', travelDate: '2026-02-10', notes: '' },
      { imageUrl: '/uploads/ticket8.jpg', line: '5号线', startStation: '天通苑北', endStation: '东单', type: 'metro', travelDate: '2026-02-15', notes: '人很多' },
      { imageUrl: '/uploads/ticket9.jpg', line: '公交1路', startStation: '四惠', endStation: '公主坟', type: 'bus', travelDate: '2026-03-01', notes: '堵车严重' },
      { imageUrl: '/uploads/ticket10.jpg', line: '2号线', startStation: '积水潭', endStation: '东直门', type: 'metro', travelDate: '2026-03-05', notes: '' },
    ]

    const ticketIds: number[] = []
    for (const t of tickets) {
      const result = insertTicket.run(t)
      ticketIds.push(Number(result.lastInsertRowid))
    }

    const trips = [
      { ticketId: ticketIds[0], line: '1号线', startStation: '天安门东', endStation: '西直门', type: 'metro', travelDate: '2026-01-05', duration: 25, notes: '早高峰出行', favorite: 1 },
      { ticketId: ticketIds[1], line: '2号线', startStation: '西直门', endStation: '国贸', type: 'metro', travelDate: '2026-01-07', duration: 30, notes: '', favorite: 0 },
      { ticketId: ticketIds[2], line: '10号线', startStation: '国贸', endStation: '知春路', type: 'metro', travelDate: '2026-01-10', duration: 35, notes: '换乘方便', favorite: 1 },
      { ticketId: ticketIds[3], line: '1号线', startStation: '王府井', endStation: '天安门东', type: 'metro', travelDate: '2026-01-12', duration: 5, notes: '短途', favorite: 0 },
      { ticketId: ticketIds[4], line: '13号线', startStation: '知春路', endStation: '西二旗', type: 'metro', travelDate: '2026-02-01', duration: 15, notes: '上班通勤', favorite: 1 },
      { ticketId: ticketIds[5], line: '4号线', startStation: '西直门', endStation: '北京南站', type: 'metro', travelDate: '2026-02-05', duration: 20, notes: '赶火车', favorite: 0 },
      { ticketId: ticketIds[6], line: '公交52路', startStation: '天安门东', endStation: '菜市口', type: 'bus', travelDate: '2026-02-10', duration: 40, notes: '', favorite: 0 },
      { ticketId: ticketIds[7], line: '5号线', startStation: '天通苑北', endStation: '东单', type: 'metro', travelDate: '2026-02-15', duration: 45, notes: '人很多', favorite: 0 },
      { ticketId: ticketIds[8], line: '公交1路', startStation: '四惠', endStation: '公主坟', type: 'bus', travelDate: '2026-03-01', duration: 50, notes: '堵车严重', favorite: 0 },
      { ticketId: ticketIds[9], line: '2号线', startStation: '积水潭', endStation: '东直门', type: 'metro', travelDate: '2026-03-05', duration: 12, notes: '', favorite: 1 },
      { ticketId: null, line: '8号线', startStation: '奥林匹克公园', endStation: '鼓楼大街', type: 'metro', travelDate: '2026-03-10', duration: 18, notes: '周末出行', favorite: 0 },
      { ticketId: null, line: '6号线', startStation: '南锣鼓巷', endStation: '朝阳门', type: 'metro', travelDate: '2026-03-12', duration: 10, notes: '', favorite: 1 },
      { ticketId: null, line: '公交300路', startStation: '国贸', endStation: '西直门', type: 'bus', travelDate: '2026-03-15', duration: 55, notes: '绕城', favorite: 0 },
      { ticketId: null, line: '9号线', startStation: '北京西站', endStation: '国家图书馆', type: 'metro', travelDate: '2026-03-18', duration: 14, notes: '赶高铁', favorite: 0 },
      { ticketId: null, line: '1号线', startStation: '天安门东', endStation: '大望路', type: 'metro', travelDate: '2026-03-20', duration: 20, notes: '', favorite: 0 },
    ]

    for (const t of trips) {
      insertTrip.run(t)
    }
  })

  seedData()
}
