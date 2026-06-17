<script lang="ts">
  import * as echarts from 'echarts'

  let {
    labels = [],
    counts = [],
    durations = [],
    chartType = 'bar',
  }: {
    labels: string[]
    counts: number[]
    durations: number[]
    chartType: 'bar' | 'line'
  } = $props()

  let chartContainer: HTMLDivElement | undefined = undefined
  let chart: echarts.ECharts | null = $state(null)
  let isMounted = $state(false)

  const lineColors: Record<string, string> = {
    primary: '#1A5CD6',
    secondary: '#43A047',
  }

  function initChart() {
    if (!chartContainer) return
    chart = echarts.init(chartContainer)
    updateChart()
  }

  function updateChart() {
    if (!chart) return

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333',
          fontSize: 12,
        },
        formatter: (params: any) => {
          let result = `<div style="font-weight: 600; margin-bottom: 4px;">${params[0]?.axisValue}</div>`
          for (const item of params) {
            const color = item.color
            const name = item.seriesName
            const value = item.value
            const unit = name.includes('次数') ? '次' : '分钟'
            result += `<div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
              <span>${name}:</span>
              <span style="font-weight: 600;">${value}${unit}</span>
            </div>`
          }
          return result
        },
      },
      legend: {
        data: ['出行次数', '出行时长'],
        bottom: 0,
        textStyle: {
          fontSize: 12,
          color: '#666',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
        axisLabel: {
          color: '#666',
          fontSize: 11,
          rotate: labels.length > 10 ? 45 : 0,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '次数',
          nameTextStyle: {
            color: '#999',
            fontSize: 11,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#999',
            fontSize: 11,
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: '时长(分)',
          nameTextStyle: {
            color: '#999',
            fontSize: 11,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#999',
            fontSize: 11,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '出行次数',
          type: chartType,
          data: counts,
          yAxisIndex: 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: lineColors.primary },
              { offset: 1, color: '#6699ff' },
            ]),
            borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
          },
          areaStyle: chartType === 'line' ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(26, 92, 214, 0.3)' },
              { offset: 1, color: 'rgba(26, 92, 214, 0.05)' },
            ]),
          } : undefined,
          smooth: chartType === 'line',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          animationDuration: 1000,
          animationEasing: 'cubicOut',
        },
        {
          name: '出行时长',
          type: chartType === 'bar' ? 'bar' : 'line',
          data: durations,
          yAxisIndex: 1,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: lineColors.secondary },
              { offset: 1, color: '#81c784' },
            ]),
            borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
          },
          areaStyle: chartType !== 'bar' ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(67, 160, 71, 0.3)' },
              { offset: 1, color: 'rgba(67, 160, 71, 0.05)' },
            ]),
          } : undefined,
          smooth: chartType !== 'bar',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          animationDuration: 1000,
          animationEasing: 'cubicOut',
          animationDelay: 200,
        },
      ],
    }

    chart.setOption(option, true)
  }

  function handleResize() {
    chart?.resize()
  }

  $effect(() => {
    if (!chartContainer) return
    isMounted = true
    chart = echarts.init(chartContainer)
    updateChart()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart?.dispose()
      chart = null
    }
  })

  $effect(() => {
    if (isMounted) {
      labels
      counts
      durations
      chartType
      updateChart()
    }
  })
</script>

<div bind:this={chartContainer} class="chart-container"></div>

<style>
  .chart-container {
    width: 100%;
    height: 300px;
  }
</style>
