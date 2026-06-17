export interface Ticket {
  id: number
  imageUrl: string
  line: string
  startStation: string
  endStation: string
  type: 'bus' | 'metro'
  travelDate: string
  notes: string
  createdAt: string
}

export interface Trip {
  id: number
  ticketId: number | null
  line: string
  startStation: string
  endStation: string
  type: 'bus' | 'metro'
  travelDate: string
  duration: number
  notes: string
  favorite: boolean
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
