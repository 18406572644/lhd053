import { writable } from 'svelte/store'

export const currentPage = writable<'tickets' | 'trips' | 'stats'>('tickets')
