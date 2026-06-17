<script lang="ts">
  import { fetchStatsOverview, fetchStatsByPeriod, fetchTopLines } from '@/utils/api'
  import StatsCard from '@/components/StatsCard.svelte'

  let overview = $state<any>({})
  let periodData = $state<any[]>([])
  let topLines = $state<any[]>([])
  let period = $state('week')
  let loading = $state(true)

  const lineColors: Record<string, string> = {
    '1号线': '#E53935', '2号线': '#1A5CD6', '3号线': '#FB8C00',
    '4号线': '#43A047', '5号线': '#8E24AA', '6号线': '#00ACC1',
    '7号线': '#F4511E', '8号线': '#6D4C41', '9号线': '#5E35B1',
  }

  let maxCount = $derived(
    periodData.length > 0
      ? Math.max(...periodData.map((d: any) => d.count || 0))
      : 1
  )

  let maxLineCount = $derived(
    topLines.length > 0
      ? Math.max(...topLines.map((l: any) => l.count || 0))
      : 1
  )

  async function loadOverview() {
    try {
      overview = await fetchStatsOverview()
    } catch {
      overview = {}
    }
  }

  async function loadPeriod() {
    try {
      const res = await fetchStatsByPeriod(period)
      const labels = res.labels || []
      const counts = res.counts || []
      periodData = labels.map((label: string, i: number) => ({
        label,
        count: counts[i] || 0,
      }))
    } catch {
      periodData = []
    }
  }

  async function loadTopLines() {
    try {
      const res = await fetchTopLines(8)
      topLines = Array.isArray(res) ? res : (res.data || [])
    } catch {
      topLines = []
    }
  }

  async function loadAll() {
    loading = true
    try {
      await Promise.all([loadOverview(), loadPeriod(), loadTopLines()])
    } finally {
      loading = false
    }
  }

  $effect(() => {
    loadAll()
  })

  function setPeriod(p: string) {
    period = p
    loadPeriod()
  }
</script>

<div class="stats-page">
  <h2 class="page-title">数据统计</h2>

  {#if loading}
    <div class="loading">加载中...</div>
  {:else}
    <div class="overview-grid">
      <StatsCard label="出行总次数" value={overview.totalTrips ?? 0} icon="🚇" color="#1A5CD6" />
      <StatsCard label="出行总时长" value={`${overview.totalDuration ?? 0}分`} icon="⏱️" color="#43A047" />
      <StatsCard label="收藏记录" value={overview.favoriteCount ?? 0} icon="⭐" color="#FB8C00" />
      <StatsCard label="乘坐线路" value={overview.lineCount ?? 0} icon="🗺️" color="#8E24AA" />
    </div>

    <div class="chart-section">
      <div class="section-header">
        <h3 class="section-title">出行趋势</h3>
        <div class="period-tabs">
          <button class="period-tab" class:active={period === 'day'} onclick={() => setPeriod('day')}>按日</button>
          <button class="period-tab" class:active={period === 'week'} onclick={() => setPeriod('week')}>按周</button>
          <button class="period-tab" class:active={period === 'month'} onclick={() => setPeriod('month')}>按月</button>
        </div>
      </div>

      {#if periodData.length === 0}
        <div class="empty-chart">暂无数据</div>
      {:else}
        <div class="bar-chart">
          {#each periodData as item (item.label)}
            <div class="bar-item">
              <div class="bar-wrapper">
                <div
                  class="bar"
                  style="height: {maxCount > 0 ? ((item.count || 0) / maxCount) * 100 : 0}%;"
                >
                  <span class="bar-value">{item.count || 0}</span>
                </div>
              </div>
              <span class="bar-label">{item.label}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="top-lines-section">
      <h3 class="section-title">热门线路</h3>
      {#if topLines.length === 0}
        <div class="empty-chart">暂无数据</div>
      {:else}
        <div class="top-lines-list">
          {#each topLines as line, i (line.line)}
            <div class="top-line-item">
              <span class="line-rank">{i + 1}</span>
              <span class="line-name" style="color: {lineColors[line.line] || '#1A5CD6'};">{line.line}</span>
              <div class="line-bar-wrapper">
                <div
                  class="line-bar"
                  style="width: {maxLineCount > 0 ? ((line.count || 0) / maxLineCount) * 100 : 0}%; background: {lineColors[line.line] || '#1A5CD6'};"
                ></div>
              </div>
              <span class="line-count">{line.count || 0}次</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .stats-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .page-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text);
  }

  .loading {
    text-align: center;
    padding: 48px;
    color: var(--color-text-light);
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  @media (max-width: 900px) {
    .overview-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .chart-section, .top-lines-section {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }

  .period-tabs {
    display: flex;
    gap: 4px;
    background: var(--color-primary-bg);
    border-radius: var(--radius-sm);
    padding: 2px;
  }

  .period-tab {
    padding: 5px 14px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-light);
    background: transparent;
    transition: all 0.2s;
  }

  .period-tab.active {
    background: var(--color-primary);
    color: var(--color-white);
  }

  .period-tab:hover:not(.active) {
    color: var(--color-primary);
  }

  .empty-chart {
    text-align: center;
    padding: 32px;
    color: var(--color-text-light);
    font-size: 14px;
  }

  .bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 200px;
    padding-top: 24px;
  }

  .bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  .bar-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
  }

  .bar {
    width: 70%;
    max-width: 40px;
    min-height: 4px;
    background: var(--color-primary);
    border-radius: 4px 4px 0 0;
    position: relative;
    transition: height 0.3s;
  }

  .bar:hover {
    background: var(--color-primary-light);
  }

  .bar-value {
    position: absolute;
    top: -20px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-primary);
    font-family: var(--font-mono);
  }

  .bar-label {
    font-size: 11px;
    color: var(--color-text-light);
    margin-top: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60px;
    text-align: center;
  }

  .top-lines-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .top-line-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .line-rank {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-light);
    width: 20px;
    text-align: center;
    font-family: var(--font-mono);
  }

  .line-name {
    font-size: 13px;
    font-weight: 600;
    width: 60px;
    flex-shrink: 0;
  }

  .line-bar-wrapper {
    flex: 1;
    height: 8px;
    background: var(--color-primary-bg);
    border-radius: 4px;
    overflow: hidden;
  }

  .line-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
    min-width: 4px;
  }

  .line-count {
    font-size: 12px;
    color: var(--color-text-light);
    width: 40px;
    text-align: right;
    font-family: var(--font-mono);
  }
</style>
