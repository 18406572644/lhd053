<script lang="ts">
  import { getLineColor } from '@/data/subwayData'
  import { currentCity } from '@/stores/app'

  let { ticket, onclick }: { ticket: any; onclick?: (t: any) => void } = $props()

  let cityId = $state($currentCity)

  currentCity.subscribe((v) => {
    cityId = v
  })

  let lineColor = $derived(getLineColor(ticket.line, cityId))

  let typeLabel = $derived(ticket.type === 'bus' ? '公交' : '地铁')
</script>

<div class="ticket-card" onclick={() => onclick?.(ticket)} onkeydown={(e) => e.key === 'Enter' && onclick?.(ticket)} role="button" tabindex="0">
  <div class="perforation"></div>
  <div class="card-body">
    <div class="card-top">
      {#if ticket.imageUrl}
        <img src={ticket.imageUrl} alt="票根" class="ticket-img" />
      {:else}
        <div class="ticket-img placeholder">🎫</div>
      {/if}
      <span class="line-badge" style="background: {lineColor};">
        {ticket.line}
      </span>
    </div>
    <div class="card-bottom">
      <div class="stations">
        <span class="station">{ticket.startStation}</span>
        <span class="arrow">→</span>
        <span class="station">{ticket.endStation}</span>
      </div>
      <div class="meta">
        <span class="type-badge" class:metro={ticket.type === 'metro'} class:bus={ticket.type === 'bus'}>
          {typeLabel}
        </span>
        <span class="date">{ticket.travelDate}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .ticket-card {
    background: var(--color-white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s;
    position: relative;
  }

  .ticket-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .perforation {
    width: 14px;
    flex-shrink: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 4px,
      var(--color-gray-light) 4px,
      var(--color-gray-light) 6px,
      transparent 6px,
      transparent 8px
    );
    border-right: 1px dashed var(--color-gray-light);
  }

  .card-body {
    flex: 1;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ticket-img {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    background: var(--color-primary-bg);
  }

  .ticket-img.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .line-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    color: var(--color-white);
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-mono);
  }

  .card-bottom {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stations {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
  }

  .station {
    color: var(--color-text);
  }

  .arrow {
    color: var(--color-primary-light);
    font-size: 12px;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--color-text-light);
  }

  .type-badge {
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  .type-badge.metro {
    background: #E3F2FD;
    color: #1565C0;
  }

  .type-badge.bus {
    background: #E8F5E9;
    color: #2E7D32;
  }

  .date {
    color: var(--color-text-light);
  }
</style>
