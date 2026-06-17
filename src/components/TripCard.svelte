<script lang="ts">
  let {
    trip,
    onFavoriteToggle,
    onDelete,
  }: {
    trip: any;
    onFavoriteToggle?: (id: number) => void;
    onDelete?: (id: number) => void;
  } = $props()

  const lineColors: Record<string, string> = {
    '1号线': '#E53935', '2号线': '#1A5CD6', '3号线': '#FB8C00',
    '4号线': '#43A047', '5号线': '#8E24AA', '6号线': '#00ACC1',
    '7号线': '#F4511E', '8号线': '#6D4C41', '9号线': '#5E35B1',
  }

  let lineColor = $derived(lineColors[trip.line] || '#1A5CD6')
</script>

<div class="trip-card">
  <div class="metro-track">
    <div class="track-line" style="background: {lineColor};"></div>
    <div class="track-dot start" style="border-color: {lineColor}; background: {lineColor};"></div>
    <div class="track-dot end" style="border-color: {lineColor};"></div>
  </div>
  <div class="trip-content">
    <div class="trip-header">
      <span class="line-tag" style="background: {lineColor};">{trip.line}</span>
      <span class="type-label">{trip.type === 'bus' ? '公交' : '地铁'}</span>
      <span class="trip-date">{trip.travelDate}</span>
    </div>
    <div class="trip-stations">
      <span class="st-name">{trip.startStation}</span>
      <span class="st-arrow">→</span>
      <span class="st-name">{trip.endStation}</span>
    </div>
    {#if trip.duration}
      <span class="duration">{trip.duration} 分钟</span>
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

  .trip-content {
    flex: 1;
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

  .duration {
    font-size: 12px;
    color: var(--color-text-light);
    font-family: var(--font-mono);
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
</style>
