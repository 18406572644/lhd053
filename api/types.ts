export interface Ticket {
  id: number
  imageUrl: string
  line: string
  startStation: string
  endStation: string
  type: 'bus' | 'metro'
  travelDate: string
  notes: string
  city: string
  createdAt: string
}

export interface TicketRef {
  id: number
  imageUrl: string
  line: string
  startStation: string
  endStation: string
  type: 'bus' | 'metro'
  travelDate: string
}

export interface Trip {
  id: number
  ticketId: number | null
  ticket: TicketRef | null
  line: string
  startStation: string
  endStation: string
  type: 'bus' | 'metro'
  travelDate: string
  duration: number
  notes: string
  favorite: boolean
  city: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
