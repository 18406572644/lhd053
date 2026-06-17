import { writable } from 'svelte/store'

export const currentPage = writable<'tickets' | 'trips' | 'stats'>('tickets')

export const highlightTripId = writable<number | null>(null)

export const openTicketId = writable<number | null>(null)

export const currentCity = writable<string>('beijing')
