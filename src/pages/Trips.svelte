<script lang="ts">
  import { fetchTrips, createTrip, toggleFavorite, deleteTrip, fetchTicketById } from '@/utils/api'
  import TripCard from '@/components/TripCard.svelte'
  import FilterBar from '@/components/FilterBar.svelte'
  import { highlightTripId, openTicketId } from '@/stores/app'

  let trips = $state<any[]>([])
  let total = $state(0)
  let page = $state(1)
  let pageSize = $state(10)
  let loading = $state(true)
  let showCreate = $state(false)
  let filter = $state({ line: '', type: '', startDate: '', endDate: '', keyword: '' })

  let formLine = $state('')
  let formStart = $state('')
  let formEnd = $state('')
  let formType = $state('bus')
  let formDate = $state('')
  let formDuration = $state('')

  let activeHighlightId = $state<number | null>(null)
  let selectedTicket = $state<any>(null)

  let lines = $derived([...new Set(trips.map((t: any) => t.line).filter(Boolean))])
  let totalPages = $derived(Math.ceil(total / pageSize))

  let keywordDebounceTimer: ReturnType<typeof setTimeout> | null = null

  async function load() {
    loading = true
    try {
      const res = await fetchTrips({
        page, pageSize,
        line: filter.line,
        type: filter.type,
        startDate: filter.startDate,
        endDate: filter.endDate,
        keyword: filter.keyword,
      })
      trips = res.data
      total = res.total
    } finally {
      loading = false
    }
  }

  $effect(() => {
    load()
  })

  highlightTripId.subscribe((id) => {
    if (id !== null) {
      activeHighlightId = id
      setTimeout(() => {
        const el = document.getElementById(`trip-${id}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      setTimeout(() => {
        activeHighlightId = null
      }, 3000)
      highlightTripId.set(null)
    }
  })

  openTicketId.subscribe(async (id) => {
    if (id !== null) {
      try {
        selectedTicket = await fetchTicketById(id)
      } catch (e) {
        console.error('加载票根详情失败', e)
      }
      openTicketId.set(null)
    }
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

  async function onFavoriteToggle(id: number) {
    await toggleFavorite(id)
    load()
  }

  async function onDeleteTrip(id: number) {
    await deleteTrip(id)
    load()
  }

  async function handleCreate() {
    if (!formLine || !formStart || !formEnd || !formDate) return
    await createTrip({
      line: formLine,
      startStation: formStart,
      endStation: formEnd,
      type: formType,
      travelDate: formDate,
      duration: formDuration ? Number(formDuration) : null,
    })
    formLine = ''; formStart = ''; formEnd = ''; formType = 'bus'
    formDate = ''; formDuration = ''
    showCreate = false
    load()
  }

  async function onTicketClick(ticketId: number) {
    try {
      selectedTicket = await fetchTicketById(ticketId)
    } catch (e) {
      console.error('加载票根详情失败', e)
    }
  }

  function closeTicketModal() {
    selectedTicket = null
  }
</script>

<div class="trips-page">
  <div class="page-header">
    <h2 class="page-title">出行记录</h2>
    <button class="create-btn" onclick={() => showCreate = !showCreate}>
      {showCreate ? '收起' : '+ 新增记录'}
    </button>
  </div>

  <FilterBar {lines} onFilter={onFilter} onKeywordChange={onKeywordChange} />

  {#if showCreate}
    <div class="create-panel">
      <div class="form-grid">
        <div class="form-item">
          <label for="tp-line">线路</label>
          <input id="tp-line" type="text" bind:value={formLine} placeholder="如: 1号线" />
        </div>
        <div class="form-item">
          <label for="tp-type">类型</label>
          <select id="tp-type" bind:value={formType}>
            <option value="bus">公交</option>
            <option value="metro">地铁</option>
          </select>
        </div>
        <div class="form-item">
          <label for="tp-start">起始站</label>
          <input id="tp-start" type="text" bind:value={formStart} placeholder="起始站" />
        </div>
        <div class="form-item">
          <label for="tp-end">终点站</label>
          <input id="tp-end" type="text" bind:value={formEnd} placeholder="终点站" />
        </div>
        <div class="form-item">
          <label for="tp-date">出行日期</label>
          <input id="tp-date" type="date" bind:value={formDate} />
        </div>
        <div class="form-item">
          <label for="tp-dur">时长(分钟)</label>
          <input id="tp-dur" type="number" bind:value={formDuration} placeholder="可选" />
        </div>
      </div>
      <button class="submit-btn" onclick={handleCreate}>保存记录</button>
    </div>
  {/if}

  {#if loading}
    <div class="loading">加载中...</div>
  {:else if trips.length === 0}
    <div class="empty">暂无出行记录</div>
  {:else}
    <div class="trip-list">
      {#each trips as trip (trip.id)}
        <TripCard
          {trip}
          highlighted={activeHighlightId === trip.id}
          onFavoriteToggle={onFavoriteToggle}
          onDelete={onDeleteTrip}
          onTicketClick={onTicketClick}
        />
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
    <div class="modal-overlay" role="dialog" tabindex="-1" onclick={closeTicketModal} onkeydown={(e) => e.key === 'Escape' && closeTicketModal()}>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal" onclick={(e) => e.stopPropagation()}>
        <button class="modal-close" onclick={closeTicketModal}>✕</button>
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
      </div>
    </div>
  {/if}
</div>

<style>
  .trips-page {
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

  .create-btn {
    padding: 8px 16px;
    background: var(--color-primary);
    color: var(--color-white);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .create-btn:hover {
    background: var(--color-primary-light);
  }

  .create-panel {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-item label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-light);
  }

  .form-item input,
  .form-item select {
    padding: 8px 10px;
    border: 1px solid var(--color-gray-light);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--color-text);
    background: var(--color-white);
  }

  .form-item input:focus,
  .form-item select:focus {
    border-color: var(--color-primary);
  }

  .submit-btn {
    width: 100%;
    padding: 10px;
    background: var(--color-primary);
    color: var(--color-white);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .submit-btn:hover {
    background: var(--color-primary-light);
  }

  .loading, .empty {
    text-align: center;
    padding: 48px;
    color: var(--color-text-light);
    font-size: 14px;
  }

  .trip-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
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
</style>
