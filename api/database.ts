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
    city TEXT NOT NULL DEFAULT 'beijing',
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
    city TEXT NOT NULL DEFAULT 'beijing',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tickets_line ON tickets(line);
  CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type);
  CREATE INDEX IF NOT EXISTS idx_tickets_travel_date ON tickets(travel_date);
  CREATE INDEX IF NOT EXISTS idx_tickets_city ON tickets(city);

  CREATE INDEX IF NOT EXISTS idx_trips_line ON trips(line);
  CREATE INDEX IF NOT EXISTS idx_trips_type ON trips(type);
  CREATE INDEX IF NOT EXISTS idx_trips_travel_date ON trips(travel_date);
  CREATE INDEX IF NOT EXISTS idx_trips_favorite ON trips(favorite);
  CREATE INDEX IF NOT EXISTS idx_trips_ticket_id ON trips(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_trips_city ON trips(city);
`)

const ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number }

if (ticketCount.count === 0) {
  const insertTicket = db.prepare(`
    INSERT INTO tickets (image_url, line, start_station, end_station, type, travel_date, notes, city)
    VALUES (@imageUrl, @line, @startStation, @endStation, @type, @travelDate, @notes, @city)
  `)

  const insertTrip = db.prepare(`
    INSERT INTO trips (ticket_id, line, start_station, end_station, type, travel_date, duration, notes, favorite, city)
    VALUES (@ticketId, @line, @startStation, @endStation, @type, @travelDate, @duration, @notes, @favorite, @city)
  `)

  const seedData = db.transaction(() => {
    const tickets = [
      { imageUrl: '/uploads/ticket1.jpg', line: '1号线', startStation: '天安门东', endStation: '西直门', type: 'metro', travelDate: '2026-01-05', notes: '早高峰出行', city: 'beijing' },
      { imageUrl: '/uploads/ticket2.jpg', line: '2号线', startStation: '西直门', endStation: '国贸', type: 'metro', travelDate: '2026-01-07', notes: '', city: 'beijing' },
      { imageUrl: '/uploads/ticket3.jpg', line: '10号线', startStation: '国贸', endStation: '知春路', type: 'metro', travelDate: '2026-01-10', notes: '换乘方便', city: 'beijing' },
      { imageUrl: '/uploads/ticket4.jpg', line: '1号线', startStation: '王府井', endStation: '天安门东', type: 'metro', travelDate: '2026-01-12', notes: '短途', city: 'beijing' },
      { imageUrl: '/uploads/ticket5.jpg', line: '13号线', startStation: '知春路', endStation: '西二旗', type: 'metro', travelDate: '2026-02-01', notes: '上班通勤', city: 'beijing' },
      { imageUrl: '/uploads/ticket6.jpg', line: '4号线', startStation: '西直门', endStation: '北京南站', type: 'metro', travelDate: '2026-02-05', notes: '赶火车', city: 'beijing' },
      { imageUrl: '/uploads/ticket7.jpg', line: '公交52路', startStation: '天安门东', endStation: '菜市口', type: 'bus', travelDate: '2026-02-10', notes: '', city: 'beijing' },
      { imageUrl: '/uploads/ticket8.jpg', line: '5号线', startStation: '天通苑北', endStation: '东单', type: 'metro', travelDate: '2026-02-15', notes: '人很多', city: 'beijing' },
      { imageUrl: '/uploads/ticket9.jpg', line: '公交1路', startStation: '四惠', endStation: '公主坟', type: 'bus', travelDate: '2026-03-01', notes: '堵车严重', city: 'beijing' },
      { imageUrl: '/uploads/ticket10.jpg', line: '2号线', startStation: '积水潭', endStation: '东直门', type: 'metro', travelDate: '2026-03-05', notes: '', city: 'beijing' },
      { imageUrl: '/uploads/ticket11.jpg', line: '1号线', startStation: '人民广场', endStation: '徐家汇', type: 'metro', travelDate: '2026-01-06', notes: '上海出差', city: 'shanghai' },
      { imageUrl: '/uploads/ticket12.jpg', line: '2号线', startStation: '浦东国际机场', endStation: '陆家嘴', type: 'metro', travelDate: '2026-01-08', notes: '接机', city: 'shanghai' },
      { imageUrl: '/uploads/ticket13.jpg', line: '10号线', startStation: '虹桥火车站', endStation: '新天地', type: 'metro', travelDate: '2026-01-15', notes: '逛商圈', city: 'shanghai' },
      { imageUrl: '/uploads/ticket14.jpg', line: '3号线', startStation: '上海火车站', endStation: '中山公园', type: 'metro', travelDate: '2026-02-02', notes: '换乘', city: 'shanghai' },
      { imageUrl: '/uploads/ticket15.jpg', line: '4号线', startStation: '宜山路', endStation: '世纪大道', type: 'metro', travelDate: '2026-02-08', notes: '环线', city: 'shanghai' },
    ]

    const ticketIds: number[] = []
    for (const t of tickets) {
      const result = insertTicket.run(t)
      ticketIds.push(Number(result.lastInsertRowid))
    }

    const trips = [
      { ticketId: ticketIds[0], line: '1号线', startStation: '天安门东', endStation: '西直门', type: 'metro', travelDate: '2026-01-05', duration: 25, notes: '早高峰出行', favorite: 1, city: 'beijing' },
      { ticketId: ticketIds[1], line: '2号线', startStation: '西直门', endStation: '国贸', type: 'metro', travelDate: '2026-01-07', duration: 30, notes: '', favorite: 0, city: 'beijing' },
      { ticketId: ticketIds[2], line: '10号线', startStation: '国贸', endStation: '知春路', type: 'metro', travelDate: '2026-01-10', duration: 35, notes: '换乘方便', favorite: 1, city: 'beijing' },
      { ticketId: ticketIds[3], line: '1号线', startStation: '王府井', endStation: '天安门东', type: 'metro', travelDate: '2026-01-12', duration: 5, notes: '短途', favorite: 0, city: 'beijing' },
      { ticketId: ticketIds[4], line: '13号线', startStation: '知春路', endStation: '西二旗', type: 'metro', travelDate: '2026-02-01', duration: 15, notes: '上班通勤', favorite: 1, city: 'beijing' },
      { ticketId: ticketIds[5], line: '4号线', startStation: '西直门', endStation: '北京南站', type: 'metro', travelDate: '2026-02-05', duration: 20, notes: '赶火车', favorite: 0, city: 'beijing' },
      { ticketId: ticketIds[6], line: '公交52路', startStation: '天安门东', endStation: '菜市口', type: 'bus', travelDate: '2026-02-10', duration: 40, notes: '', favorite: 0, city: 'beijing' },
      { ticketId: ticketIds[7], line: '5号线', startStation: '天通苑北', endStation: '东单', type: 'metro', travelDate: '2026-02-15', duration: 45, notes: '人很多', favorite: 0, city: 'beijing' },
      { ticketId: ticketIds[8], line: '公交1路', startStation: '四惠', endStation: '公主坟', type: 'bus', travelDate: '2026-03-01', duration: 50, notes: '堵车严重', favorite: 0, city: 'beijing' },
      { ticketId: ticketIds[9], line: '2号线', startStation: '积水潭', endStation: '东直门', type: 'metro', travelDate: '2026-03-05', duration: 12, notes: '', favorite: 1, city: 'beijing' },
      { ticketId: null, line: '8号线', startStation: '奥林匹克公园', endStation: '鼓楼大街', type: 'metro', travelDate: '2026-03-10', duration: 18, notes: '周末出行', favorite: 0, city: 'beijing' },
      { ticketId: null, line: '6号线', startStation: '南锣鼓巷', endStation: '朝阳门', type: 'metro', travelDate: '2026-03-12', duration: 10, notes: '', favorite: 1, city: 'beijing' },
      { ticketId: null, line: '公交300路', startStation: '国贸', endStation: '西直门', type: 'bus', travelDate: '2026-03-15', duration: 55, notes: '绕城', favorite: 0, city: 'beijing' },
      { ticketId: null, line: '9号线', startStation: '北京西站', endStation: '国家图书馆', type: 'metro', travelDate: '2026-03-18', duration: 14, notes: '赶高铁', favorite: 0, city: 'beijing' },
      { ticketId: null, line: '1号线', startStation: '天安门东', endStation: '大望路', type: 'metro', travelDate: '2026-03-20', duration: 20, notes: '', favorite: 0, city: 'beijing' },
      { ticketId: ticketIds[10], line: '1号线', startStation: '人民广场', endStation: '徐家汇', type: 'metro', travelDate: '2026-01-06', duration: 15, notes: '上海出差', favorite: 1, city: 'shanghai' },
      { ticketId: ticketIds[11], line: '2号线', startStation: '浦东国际机场', endStation: '陆家嘴', type: 'metro', travelDate: '2026-01-08', duration: 60, notes: '接机', favorite: 0, city: 'shanghai' },
      { ticketId: ticketIds[12], line: '10号线', startStation: '虹桥火车站', endStation: '新天地', type: 'metro', travelDate: '2026-01-15', duration: 25, notes: '逛商圈', favorite: 1, city: 'shanghai' },
      { ticketId: ticketIds[13], line: '3号线', startStation: '上海火车站', endStation: '中山公园', type: 'metro', travelDate: '2026-02-02', duration: 20, notes: '换乘', favorite: 0, city: 'shanghai' },
      { ticketId: ticketIds[14], line: '4号线', startStation: '宜山路', endStation: '世纪大道', type: 'metro', travelDate: '2026-02-08', duration: 30, notes: '环线', favorite: 1, city: 'shanghai' },
      { ticketId: null, line: '2号线', startStation: '陆家嘴', endStation: '南京东路', type: 'metro', travelDate: '2026-02-12', duration: 8, notes: '逛街', favorite: 0, city: 'shanghai' },
      { ticketId: null, line: '10号线', startStation: '新天地', endStation: '豫园', type: 'metro', travelDate: '2026-02-18', duration: 10, notes: '景点', favorite: 1, city: 'shanghai' },
      { ticketId: null, line: '1号线', startStation: '徐家汇', endStation: '衡山路', type: 'metro', travelDate: '2026-03-02', duration: 5, notes: '短途', favorite: 0, city: 'shanghai' },
      { ticketId: null, line: '3号线', startStation: '中山公园', endStation: '延安西路', type: 'metro', travelDate: '2026-03-08', duration: 8, notes: '', favorite: 0, city: 'shanghai' },
    ]

    for (const t of trips) {
      insertTrip.run(t)
    }
  })

  seedData()
}
