<script lang="ts">
  import { 
    fetchStatsOverview, 
    fetchStatsByPeriod, 
    fetchTopLines,
    fetchDurationDistribution,
    fetchLineHeatmap,
    fetchPeriodComparison,
  } from '@/utils/api'
  import StatsCard from '@/components/StatsCard.svelte'
  import TrendChart from '@/components/TrendChart.svelte'
  import DurationPie from '@/components/DurationPie.svelte'
  import LineBubble from '@/components/LineBubble.svelte'
  import PeriodIndicator from '@/components/PeriodIndicator.svelte'

  let overview = $state<any>({})
  let periodData = $state<any[]>([])
  let periodLabels = $state<string[]>([])
  let periodCounts = $state<number[]>([])
  let periodDurations = $state<number[]>([])
  let topLines = $state<any[]>([])
  let durationDist = $state<any>({ bus: { duration: 0, count: 0 }, metro: { duration: 0, count: 0 } })
  let lineHeatmap = $state<any[]>([])
  let periodComparison = $state<any>({})
  let period = $state<'day' | 'week' | 'month'>('week')
  let trendChartType = $state<'bar' | 'line'>('bar')
  let activeTab = $state<'trend' | 'heatmap'>('trend')
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
      const durations = res.durations || []
      periodLabels = labels
      periodCounts = counts
      periodDurations = durations
      periodData = labels.map((label: string, i: number) => ({
        label,
        count: counts[i] || 0,
        duration: durations[i] || 0,
      }))
    } catch {
      periodLabels = []
      periodCounts = []
      periodDurations = []
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

  async function loadDurationDistribution() {
    try {
      durationDist = await fetchDurationDistribution()
    } catch {
      durationDist = { bus: { duration: 0, count: 0 }, metro: { duration: 0, count: 0 } }
    }
  }

  async function loadLineHeatmap() {
    try {
      const res = await fetchLineHeatmap()
      lineHeatmap = Array.isArray(res) ? res : []
    } catch {
      lineHeatmap = []
    }
  }

  async function loadPeriodComparison() {
    try {
      periodComparison = await fetchPeriodComparison(period === 'day' ? 'week' : period)
    } catch {
      periodComparison = {}
    }
  }

  async function loadAll() {
    loading = true
    try {
      await Promise.all([
        loadOverview(),
        loadPeriod(),
        loadTopLines(),
        loadDurationDistribution(),
        loadLineHeatmap(),
        loadPeriodComparison(),
      ])
    } finally {
      loading = false
    }
  }

  $effect(() => {
    loadAll()
  })

  function setPeriod(p: 'day' | 'week' | 'month') {
    period = p
  }

  $effect(() => {
    period
    loadPeriod()
    loadPeriodComparison()
  })

  function setTrendChartType(type: 'bar' | 'line') {
    trendChartType = type
  }
</script>

<svelte:head>
  <style>
    .js-only { display: block; }
    .nojs-only { display: none; }
  </style>
  <noscript>
    <style>
      .js-only { display: none !important; }
      .nojs-only { display: block !important; }
    </style>
  </noscript>
</svelte:head>

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

    <div class="charts-grid">
      <div class="chart-section main-chart">
        <div class="section-header">
          <h3 class="section-title">出行趋势</h3>
          <div class="chart-controls">
            <div class="period-tabs">
              <button class="period-tab" class:active={period === 'day'} onclick={() => setPeriod('day')}>按日</button>
              <button class="period-tab" class:active={period === 'week'} onclick={() => setPeriod('week')}>按周</button>
              <button class="period-tab" class:active={period === 'month'} onclick={() => setPeriod('month')}>按月</button>
            </div>
            <div class="chart-type-tabs js-only">
              <button class="chart-type-tab" class:active={trendChartType === 'bar'} onclick={() => setTrendChartType('bar')}>柱状图</button>
              <button class="chart-type-tab" class:active={trendChartType === 'line'} onclick={() => setTrendChartType('line')}>折线图</button>
            </div>
          </div>
        </div>

        {#if periodLabels.length === 0}
          <div class="empty-chart">暂无数据</div>
        {:else}
          <div class="nojs-only">
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
          </div>

          <div class="js-only">
            <TrendChart
              labels={periodLabels}
              counts={periodCounts}
              durations={periodDurations}
              chartType={trendChartType}
            />
          </div>
        {/if}
      </div>

      <div class="chart-section">
        <div class="section-header">
          <h3 class="section-title">时长分布</h3>
        </div>
        <div class="nojs-only">
          <div class="duration-fallback">
            <div class="duration-item">
              <div class="duration-label">
                <span class="duration-dot bus"></span>
                <span>公交</span>
              </div>
              <div class="duration-bar-wrapper">
                <div 
                  class="duration-bar bus" 
                  style="width: {durationDist.bus.duration + durationDist.metro.duration > 0 
                    ? (durationDist.bus.duration / (durationDist.bus.duration + durationDist.metro.duration)) * 100 
                    : 0}%;"
                ></div>
              </div>
              <div class="duration-value">{durationDist.bus.duration}分 ({durationDist.bus.count}次)</div>
            </div>
            <div class="duration-item">
              <div class="duration-label">
                <span class="duration-dot metro"></span>
                <span>地铁</span>
              </div>
              <div class="duration-bar-wrapper">
                <div 
                  class="duration-bar metro" 
                  style="width: {durationDist.bus.duration + durationDist.metro.duration > 0 
                    ? (durationDist.metro.duration / (durationDist.bus.duration + durationDist.metro.duration)) * 100 
                    : 0}%;"
                ></div>
              </div>
              <div class="duration-value">{durationDist.metro.duration}分 ({durationDist.metro.count}次)</div>
            </div>
          </div>
        </div>
        <div class="js-only">
          <DurationPie
            busDuration={durationDist.bus?.duration || 0}
            metroDuration={durationDist.metro?.duration || 0}
            busCount={durationDist.bus?.count || 0}
            metroCount={durationDist.metro?.count || 0}
          />
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-section main-chart">
        <div class="section-header">
          <div class="tabs">
            <button class="tab" class:active={activeTab === 'trend'} onclick={() => activeTab = 'trend'}>热门线路</button>
            <button class="tab" class:active={activeTab === 'heatmap'} onclick={() => activeTab = 'heatmap'}>线路热度</button>
          </div>
        </div>

        {#if activeTab === 'trend'}
          {#if topLines.length === 0}
            <div class="empty-chart">暂无数据</div>
          {:else}
            <div class="nojs-only">
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
            </div>
            <div class="js-only">
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
            </div>
          {/if}
        {:else}
          {#if lineHeatmap.length === 0}
            <div class="empty-chart">暂无数据</div>
          {:else}
            <div class="nojs-only">
              <div class="heatmap-fallback">
                {#each lineHeatmap as item (item.line)}
                  <div class="heatmap-item">
                    <span class="heatmap-name">{item.line}</span>
                    <div class="heatmap-stats">
                      <span>{item.tripCount}次</span>
                      <span>{item.totalDuration}分</span>
                      <span>平均{item.avgDuration.toFixed(1)}分</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
            <div class="js-only">
              <LineBubble data={lineHeatmap} />
            </div>
          {/if}
        {/if}
      </div>

      <div>
        <PeriodIndicator
          period={period === 'day' ? 'week' : (period as 'week' | 'month')}
          currentLabel={periodComparison.current?.label || ''}
          previousLabel={periodComparison.previous?.label || ''}
          currentCount={periodComparison.current?.count || 0}
          previousCount={periodComparison.previous?.count || 0}
          currentDuration={periodComparison.current?.duration || 0}
          previousDuration={periodComparison.previous?.duration || 0}
          countChange={periodComparison.countChange || 0}
          durationChange={periodComparison.durationChange || 0}
        />
      </div>
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

  .charts-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }

  @media (max-width: 900px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
  }

  .chart-section, .main-chart {
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

  .chart-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .period-tabs, .chart-type-tabs, .tabs {
    display: flex;
    gap: 4px;
    background: var(--color-primary-bg);
    border-radius: var(--radius-sm);
    padding: 2px;
  }

  .period-tab, .chart-type-tab, .tab {
    padding: 5px 14px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-light);
    background: transparent;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }

  .period-tab.active, .chart-type-tab.active, .tab.active {
    background: var(--color-primary);
    color: var(--color-white);
  }

  .period-tab:hover:not(.active), .chart-type-tab:hover:not(.active), .tab:hover:not(.active) {
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
    height: 300px;
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

  .duration-fallback {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
  }

  .duration-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .duration-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
  }

  .duration-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .duration-dot.bus {
    background: #FB8C00;
  }

  .duration-dot.metro {
    background: #1A5CD6;
  }

  .duration-bar-wrapper {
    width: 100%;
    height: 8px;
    background: var(--color-primary-bg);
    border-radius: 4px;
    overflow: hidden;
  }

  .duration-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }

  .duration-bar.bus {
    background: #FB8C00;
  }

  .duration-bar.metro {
    background: #1A5CD6;
  }

  .duration-value {
    font-size: 12px;
    color: var(--color-text-light);
    font-family: var(--font-mono);
  }

  .heatmap-fallback {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 0;
  }

  .heatmap-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: var(--color-primary-bg);
    border-radius: 8px;
  }

  .heatmap-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
  }

  .heatmap-stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: var(--color-text-light);
    font-family: var(--font-mono);
  }
</style>
