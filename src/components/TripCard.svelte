<script lang="ts">
  import SubwayMap from '@/components/SubwayMap.svelte'
  import { getStationCoords, getLineColor } from '@/data/subwayData'
  import { currentCity } from '@/stores/app'

  let {
    trip,
    onFavoriteToggle,
    onDelete,
    onTicketClick,
    highlighted,
  }: {
    trip: any;
    onFavoriteToggle?: (id: number) => void;
    onDelete?: (id: number) => void;
    onTicketClick?: (ticketId: number) => void;
    highlighted?: boolean;
  } = $props()

  let cityId = $state($currentCity)

  currentCity.subscribe((v) => {
    cityId = v
  })

  let lineColor = $derived(getLineColor(trip.line, cityId))
  let showMap = $state(false)
  let hasMapData = $derived(
    trip.type === 'metro' &&
    getStationCoords(trip.startStation, cityId) &&
    getStationCoords(trip.endStation, cityId)
  )

  function toggleMap() {
    if (hasMapData) {
      showMap = !showMap
    }
  }
</script>

<div class="trip-card" class:highlighted={highlighted} id="trip-{trip.id}">
  <div class="metro-track">
    <div class="track-line" style="background: {lineColor};"></div>
    <div class="track-dot start" style="border-color: {lineColor}; background: {lineColor};"></div>
    <div class="track-dot end" style="border-color: {lineColor};"></div>
  </div>
  <div class="trip-main">
    <div class="trip-content">
      <div class="trip-header">
        <span class="line-tag" style="background: {lineColor};">{trip.line}</span>
        <span class="type-label">{trip.type === 'bus' ? '公交' : '地铁'}</span>
        <span class="trip-date">{trip.travelDate}</span>
        {#if trip.ticketId}
          <span class="ticket-badge linked" title="有关联票根">已关联票根</span>
        {:else}
          <span class="ticket-badge manual" title="手动创建">无关联票根</span>
        {/if}
      </div>
      <div class="trip-stations">
        <span class="st-name">{trip.startStation}</span>
        <span class="st-arrow">→</span>
        <span class="st-name">{trip.endStation}</span>
      </div>
      <div class="trip-footer">
        {#if trip.duration}
          <span class="duration">{trip.duration} 分钟</span>
        {/if}
        {#if hasMapData}
          <button class="map-toggle" onclick={toggleMap}>
            <span class="map-icon">🗺️</span>
            {showMap ? '收起地图' : '查看路线'}
          </button>
        {/if}
        {#if trip.ticket && trip.ticket.imageUrl}
          <button class="ticket-thumb" onclick={() => onTicketClick?.(trip.ticketId)} title="查看票根">
            <img src={trip.ticket.imageUrl} alt="票根" />
          </button>
        {/if}
      </div>
    </div>

    {#if showMap && hasMapData}
      <div class="trip-map">
        <SubwayMap
          startStation={trip.startStation}
          endStation={trip.endStation}
          lineName={trip.line}
          height="200px"
        />
      </div>
    {/if}
  </div>
  <div class="trip-actions">
    <button
      class="action-btn fav"
      class:active={trip.favorite}
      onclick={() => onFavoriteToggle?.(trip.id)}
      title="收藏"
    >
      {trip.favorite ? '★' : '☆'}
    </button>
    <button class="action-btn del" onclick={() => onDelete?.(trip.id)} title="删除">
      ✕
    </button>
  </div>
</div>

<style>
  .trip-card {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 16px;
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: stretch;
    gap: 14px;
    transition: box-shadow 0.2s;
  }

  .trip-card:hover {
    box-shadow: var(--shadow-md);
  }

  .metro-track {
    position: relative;
    width: 16px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .track-line {
    position: absolute;
    width: 3px;
    top: 8px;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
  }

  .track-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid;
    position: relative;
    z-index: 1;
    background: var(--color-white);
  }

  .track-dot.start {
    margin-top: 0;
  }

  .track-dot.end {
    margin-top: auto;
  }

  .trip-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .trip-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .trip-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .line-tag {
    padding: 1px 8px;
    border-radius: 10px;
    color: var(--color-white);
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
  }

  .type-label {
    font-size: 11px;
    color: var(--color-text-light);
    padding: 1px 6px;
    background: var(--color-primary-bg);
    border-radius: 4px;
  }

  .trip-date {
    font-size: 12px;
    color: var(--color-text-light);
  }

  .trip-stations {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
  }

  .st-name {
    color: var(--color-text);
  }

  .st-arrow {
    color: var(--color-primary-light);
    font-size: 12px;
  }

  .trip-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .duration {
    font-size: 12px;
    color: var(--color-text-light);
    font-family: var(--font-mono);
  }

  .map-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    background: var(--color-primary-bg);
    color: var(--color-primary);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .map-toggle:hover {
    background: var(--color-primary);
    color: var(--color-white);
  }

  .map-icon {
    font-size: 13px;
  }

  .trip-map {
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  .trip-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: transparent;
    color: var(--color-text-light);
    transition: all 0.2s;
  }

  .action-btn.fav:hover {
    background: #FFF8E1;
    color: #F9A825;
  }

  .action-btn.fav.active {
    color: #F9A825;
  }

  .action-btn.del:hover {
    background: #FFEBEE;
    color: #E53935;
  }

  .trip-card.highlighted {
    box-shadow: 0 0 0 2px var(--color-primary), var(--shadow-md);
    animation: highlightPulse 1.5s ease-in-out;
  }

  @keyframes highlightPulse {
    0%, 100% { box-shadow: 0 0 0 2px var(--color-primary), var(--shadow-md); }
    50% { box-shadow: 0 0 0 4px var(--color-primary-light), var(--shadow-md); }
  }

  .ticket-badge {
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 10px;
    font-weight: 500;
  }

  .ticket-badge.linked {
    background: #E8F5E9;
    color: #2E7D32;
  }

  .ticket-badge.manual {
    background: #FFF3E0;
    color: #E65100;
  }

  .ticket-thumb {
    padding: 0;
    border: 2px solid var(--color-gray-light);
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--color-white);
    cursor: pointer;
    transition: all 0.2s;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .ticket-thumb:hover {
    border-color: var(--color-primary);
    transform: scale(1.05);
  }

  .ticket-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
</style>
