<script lang="ts">
  import * as echarts from 'echarts'

  const props = $props<{
    busDuration: number
    metroDuration: number
    busCount: number
    metroCount: number
  }>()

  let chartContainer: HTMLDivElement | undefined
  let chart: echarts.ECharts | null = null

  const colors = {
    bus: '#FB8C00',
    metro: '#1A5CD6',
  }

  function buildOption(): echarts.EChartsOption {
    const busDuration = props.busDuration ?? 0
    const metroDuration = props.metroDuration ?? 0
    const busCount = props.busCount ?? 0
    const metroCount = props.metroCount ?? 0

    const totalDuration = busDuration + metroDuration

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const data = params.data
          const count = data.extra?.count || 0
          return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${params.color};"></span>
              <span>时长:</span>
              <span style="font-weight: 600;">${data.value}分钟</span>
              <span style="color: #999;">(${params.percent}%)</span>
            </div>
            <div style="margin-top: 4px; color: #666; font-size: 11px;">
              出行次数: ${count}次
            </div>`
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: {
          fontSize: 12,
          color: '#666',
        },
        formatter: (name: string) => {
          const data = name === '公交' 
            ? { value: busDuration, count: busCount }
            : { value: metroDuration, count: metroCount }
          const percent = totalDuration > 0 ? ((data.value / totalDuration) * 100).toFixed(1) : '0'
          return `${name}  ${percent}%`
        },
      },
      series: [
        {
          name: '时长分布',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold',
              formatter: (params: any) => {
                return `{name|${params.name}}\n{value|${params.value}分钟}`
              },
              rich: {
                name: {
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 24,
                },
                value: {
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#333',
                },
              },
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { 
              value: busDuration, 
              name: '公交', 
              itemStyle: { color: colors.bus },
              extra: { count: busCount },
            } as any,
            { 
              value: metroDuration, 
              name: '地铁', 
              itemStyle: { color: colors.metro },
              extra: { count: metroCount },
            } as any,
          ],
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: () => Math.random() * 200,
        },
      ],
    }
  }

  function handleResize() {
    chart?.resize()
  }

  $effect(() => {
    if (!chartContainer) return
    chart = echarts.init(chartContainer)
    chart.setOption(buildOption())
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart?.dispose()
      chart = null
    }
  })

  $effect(() => {
    if (!chart) return
    props.busDuration
    props.metroDuration
    props.busCount
    props.metroCount
    chart.setOption(buildOption(), true)
  })
</script>

<div class="chart-wrapper">
  <div class="chart-summary">
    <div class="summary-item">
      <span class="summary-label">总时长</span>
      <span class="summary-value">{(props.busDuration ?? 0) + (props.metroDuration ?? 0)}<span class="summary-unit">分钟</span></span>
    </div>
    <div class="summary-item">
      <span class="summary-label">总次数</span>
      <span class="summary-value">{(props.busCount ?? 0) + (props.metroCount ?? 0)}<span class="summary-unit">次</span></span>
    </div>
  </div>
  <div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
  .chart-wrapper {
    position: relative;
    width: 100%;
    height: 280px;
  }

  .chart-container {
    width: 100%;
    height: 100%;
  }

  .chart-summary {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .summary-label {
    font-size: 11px;
    color: #999;
  }

  .summary-value {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    font-family: var(--font-mono);
  }

  .summary-unit {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    margin-left: 2px;
  }
</style>
