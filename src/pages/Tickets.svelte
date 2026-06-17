<script lang="ts">
  import { fetchTickets, deleteTicket, fetchTrips } from '@/utils/api'
  import TicketCard from '@/components/TicketCard.svelte'
  import TicketUpload from '@/components/TicketUpload.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import { currentPage, highlightTripId, currentCity } from '@/stores/app'

  let tickets = $state<any[]>([])
  let total = $state(0)
  let page = $state(1)
  let pageSize = $state(12)
  let loading = $state(true)
  let showUpload = $state(false)
  let selectedTicket = $state<any>(null)
  let selectedTicketTrips = $state<any[]>([])
  let filter = $state({ line: '', type: '', startDate: '', endDate: '', keyword: '' })
  let cityId = $state($currentCity)

  let lines = $derived([...new Set(tickets.map((t: any) => t.line).filter(Boolean))])
  let totalPages = $derived(Math.ceil(total / pageSize))

  let keywordDebounceTimer: ReturnType<typeof setTimeout> | null = null

  currentCity.subscribe((v) => {
    cityId = v
    page = 1
    load()
  })

  async function load() {
    loading = true
    try {
      const res = await fetchTickets({
        page, pageSize,
        line: filter.line,
        type: filter.type,
        startDate: filter.startDate,
        endDate: filter.endDate,
        keyword: filter.keyword,
        city: cityId,
      })
      tickets = res.data
      total = res.total
    } finally {
      loading = false
    }
  }

  $effect(() => {
    load()
  })

  function onFilter(f: { line: string; type: string; startDate: string; endDate: string }) {
    filter = { ...filter, ...f }
    page = 1
    load()
  }

  function onKeywordChange(keyword: string) {
    filter = { ...filter, keyword }
    page = 1
    if (keywordDebounceTimer) {
      clearTimeout(keywordDebounceTimer)
    }
    keywordDebounceTimer = setTimeout(() => {
      load()
    }, 300)
  }

  function onPageChange(p: number) {
    page = p
    load()
  }

  async function onDeleteTicket(id: number) {
    await deleteTicket(id)
    load()
  }

  async function selectTicket(t: any) {
    selectedTicket = t
    selectedTicketTrips = []
    try {
      const res = await fetchTrips({ ticketId: t.id, pageSize: 50, city: cityId })
      selectedTicketTrips = res.data
    } catch (e) {
      console.error('加载关联出行记录失败', e)
    }
  }

  function closeModal() {
    selectedTicket = null
    selectedTicketTrips = []
  }

  function goToTrip(tripId: number) {
    highlightTripId.set(tripId)
    currentPage.set('trips')
    closeModal()
  }
</script>

<div class="tickets-page">
  <div class="page-header">
    <h2 class="page-title">票根存档</h2>
    <button class="toggle-upload" onclick={() => showUpload = !showUpload}>
      {showUpload ? '收起' : '+ 上传票根'}
    </button>
  </div>

  <FilterBar {lines} onFilter={onFilter} onKeywordChange={onKeywordChange} />

  {#if showUpload}
    <div class="upload-section">
      <TicketUpload onUpload={load} />
    </div>
  {/if}

  {#if loading}
    <div class="loading">加载中...</div>
  {:else if tickets.length === 0}
    <div class="empty">暂无票根记录</div>
  {:else}
    <div class="ticket-grid">
      {#each tickets as ticket (ticket.id)}
        <TicketCard {ticket} onclick={selectTicket} />
      {/each}
    </div>

    {#if totalPages > 1}
      <div class="pagination">
        <button class="page-btn" disabled={page <= 1} onclick={() => onPageChange(page - 1)}>上一页</button>
        <span class="page-info">{page} / {totalPages}</span>
        <button class="page-btn" disabled={page >= totalPages} onclick={() => onPageChange(page + 1)}>下一页</button>
      </div>
    {/if}
  {/if}

  {#if selectedTicket}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-overlay" role="dialog" tabindex="-1" onclick={closeModal} onkeydown={(e) => e.key === 'Escape' && closeModal()}>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal" onclick={(e) => e.stopPropagation()}>
        <button class="modal-close" onclick={closeModal}>✕</button>
        {#if selectedTicket.imageUrl}
          <img src={selectedTicket.imageUrl} alt="票根" class="modal-img" />
        {/if}
        <div class="modal-info">
          <h3>{selectedTicket.line}</h3>
          <p>{selectedTicket.startStation} → {selectedTicket.endStation}</p>
          <p>{selectedTicket.travelDate} · {selectedTicket.type === 'bus' ? '公交' : '地铁'}</p>
          {#if selectedTicket.notes}
            <p class="modal-notes">{selectedTicket.notes}</p>
          {/if}
        </div>

        <div class="related-trips">
          <div class="related-trips-header">
            <h4>关联出行记录</h4>
            <span class="related-trips-count">{selectedTicketTrips.length} 条</span>
          </div>
          {#if selectedTicketTrips.length === 0}
            <p class="related-empty">暂无关联出行记录</p>
          {:else}
            <ul class="related-trips-list">
              {#each selectedTicketTrips as trip (trip.id)}
                <li>
                  <button class="related-trip-item" onclick={() => goToTrip(trip.id)}>
                    <span class="rt-line">{trip.line}</span>
                    <span class="rt-stations">{trip.startStation} → {trip.endStation}</span>
                    <span class="rt-date">{trip.travelDate}</span>
                    <span class="rt-arrow">›</span>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <button class="modal-delete" onclick={() => { onDeleteTicket(selectedTicket.id); closeModal(); }}>删除</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .tickets-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text);
  }

  .toggle-upload {
    padding: 8px 16px;
    background: var(--color-primary);
    color: var(--color-white);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .toggle-upload:hover {
    background: var(--color-primary-light);
  }

  .upload-section {
    margin-bottom: 4px;
  }

  .loading, .empty {
    text-align: center;
    padding: 48px;
    color: var(--color-text-light);
    font-size: 14px;
  }

  .ticket-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 900px) {
    .ticket-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .ticket-grid {
      grid-template-columns: 1fr;
    }
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px 0;
  }

  .page-btn {
    padding: 6px 16px;
    background: var(--color-white);
    border: 1px solid var(--color-gray-light);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--color-text);
    transition: all 0.2s;
  }

  .page-btn:hover:not(:disabled) {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 13px;
    color: var(--color-text-light);
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .modal {
    background: var(--color-white);
    border-radius: var(--radius-lg);
    padding: 24px;
    max-width: 480px;
    width: 90%;
    position: relative;
    box-shadow: var(--shadow-lg);
  }

  .modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--color-text-light);
    background: transparent;
  }

  .modal-close:hover {
    background: var(--color-gray-light);
  }

  .modal-img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: var(--radius-sm);
    margin-bottom: 16px;
  }

  .modal-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .modal-info h3 {
    font-size: 18px;
    font-weight: 600;
  }

  .modal-info p {
    font-size: 14px;
    color: var(--color-text-light);
  }

  .modal-notes {
    margin-top: 4px;
    padding: 8px;
    background: var(--color-primary-bg);
    border-radius: var(--radius-sm);
  }

  .modal-delete {
    margin-top: 16px;
    padding: 8px 20px;
    background: #FFEBEE;
    color: #E53935;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
  }

  .modal-delete:hover {
    background: #FFCDD2;
  }

  .related-trips {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--color-gray-light);
  }

  .related-trips-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .related-trips-header h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
  }

  .related-trips-count {
    font-size: 12px;
    color: var(--color-text-light);
  }

  .related-empty {
    font-size: 13px;
    color: var(--color-text-light);
    padding: 8px 0;
  }

  .related-trips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 200px;
    overflow-y: auto;
  }

  .related-trips-list > li {
    padding: 0;
    margin: 0;
  }

  .related-trip-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--color-primary-bg);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.2s;
    font-size: 13px;
    font-family: inherit;
    text-align: left;
  }

  .related-trip-item:hover {
    background: #E3F2FD;
  }

  .rt-line {
    flex-shrink: 0;
    padding: 1px 8px;
    background: var(--color-primary);
    color: var(--color-white);
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }

  .rt-stations {
    flex: 1;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rt-date {
    flex-shrink: 0;
    color: var(--color-text-light);
    font-size: 12px;
  }

  .rt-arrow {
    flex-shrink: 0;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 16px;
  }
</style>
