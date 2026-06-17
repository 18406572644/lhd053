<script lang="ts">
  let {
    period = 'week',
    currentLabel = '',
    previousLabel = '',
    currentCount = 0,
    previousCount = 0,
    currentDuration = 0,
    previousDuration = 0,
    countChange = 0,
    durationChange = 0,
  }: {
    period: 'week' | 'month'
    currentLabel: string
    previousLabel: string
    currentCount: number
    previousCount: number
    currentDuration: number
    previousDuration: number
    countChange: number
    durationChange: number
  } = $props()

  const periodLabels: Record<string, string> = {
    week: '本周',
    month: '本月',
  }

  const periodPrevLabels: Record<string, string> = {
    week: '上周',
    month: '上月',
  }

  function formatChange(value: number): { text: string; isPositive: boolean; isZero: boolean } {
    if (value === 0) return { text: '持平', isPositive: false, isZero: true }
    const sign = value > 0 ? '+' : ''
    return { text: `${sign}${value.toFixed(1)}%`, isPositive: value > 0, isZero: false }
  }

  let countChangeInfo = $derived(formatChange(countChange))
  let durationChangeInfo = $derived(formatChange(durationChange))
  let currentPeriodLabel = $derived(periodLabels[period] || '本期')
  let prevPeriodLabel = $derived(periodPrevLabels[period] || '上期')
</script>

<div class="indicator-card">
  <div class="indicator-header">
    <span class="indicator-title">{currentPeriodLabel}对比</span>
    <span class="indicator-period">{currentLabel || '--'}</span>
  </div>

  <div class="indicator-body">
    <div class="indicator-item">
      <div class="item-header">
        <span class="item-label">出行次数</span>
        <span class="item-change" class:positive={countChangeInfo.isPositive} class:negative={!countChangeInfo.isPositive && !countChangeInfo.isZero}>
          {#if !countChangeInfo.isZero}
            <span class="change-icon">{countChangeInfo.isPositive ? '↑' : '↓'}</span>
          {/if}
          {countChangeInfo.text}
        </span>
      </div>
      <div class="item-values">
        <div class="value-current">
          <span class="value-number">{currentCount}</span>
          <span class="value-unit">次</span>
        </div>
        <div class="value-compare">
          <span class="compare-label">{prevPeriodLabel}:</span>
          <span class="compare-value">{previousCount}次</span>
        </div>
      </div>
      <div class="item-progress">
        <div class="progress-bar">
          <div 
            class="progress-current" 
            style="width: {previousCount > 0 ? Math.min(100, (currentCount / previousCount) * 100) : 100}%;"
          ></div>
        </div>
      </div>
    </div>

    <div class="indicator-divider"></div>

    <div class="indicator-item">
      <div class="item-header">
        <span class="item-label">出行时长</span>
        <span class="item-change" class:positive={durationChangeInfo.isPositive} class:negative={!durationChangeInfo.isPositive && !durationChangeInfo.isZero}>
          {#if !durationChangeInfo.isZero}
            <span class="change-icon">{durationChangeInfo.isPositive ? '↑' : '↓'}</span>
          {/if}
          {durationChangeInfo.text}
        </span>
      </div>
      <div class="item-values">
        <div class="value-current">
          <span class="value-number">{currentDuration}</span>
          <span class="value-unit">分钟</span>
        </div>
        <div class="value-compare">
          <span class="compare-label">{prevPeriodLabel}:</span>
          <span class="compare-value">{previousDuration}分钟</span>
        </div>
      </div>
      <div class="item-progress">
        <div class="progress-bar">
          <div 
            class="progress-current duration" 
            style="width: {previousDuration > 0 ? Math.min(100, (currentDuration / previousDuration) * 100) : 100}%;"
          ></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .indicator-card {
    background: var(--color-white);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
  }

  .indicator-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .indicator-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }

  .indicator-period {
    font-size: 12px;
    color: var(--color-text-light);
    background: var(--color-primary-bg);
    padding: 4px 10px;
    border-radius: 4px;
  }

  .indicator-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .indicator-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .indicator-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 4px 0;
  }

  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .item-label {
    font-size: 13px;
    color: var(--color-text-light);
  }

  .item-change {
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-mono);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .item-change.positive {
    color: #E53935;
    background: rgba(229, 57, 53, 0.1);
  }

  .item-change.negative {
    color: #43A047;
    background: rgba(67, 160, 71, 0.1);
  }

  .change-icon {
    margin-right: 2px;
  }

  .item-values {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .value-current {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .value-number {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    font-family: var(--font-mono);
    line-height: 1;
  }

  .value-unit {
    font-size: 13px;
    color: var(--color-text-light);
    font-weight: 500;
  }

  .value-compare {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }

  .compare-label {
    color: var(--color-text-light);
  }

  .compare-value {
    color: var(--color-text);
    font-weight: 500;
    font-family: var(--font-mono);
  }

  .item-progress {
    width: 100%;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--color-primary-bg);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-current {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), #6699ff);
    border-radius: 3px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-current.duration {
    background: linear-gradient(90deg, var(--color-success, #43A047), #81c784);
  }
</style>
