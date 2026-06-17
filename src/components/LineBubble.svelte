<script lang="ts">
  import * as echarts from 'echarts'

  let {
    data = [],
  }: {
    data: Array<{
      line: string
      type: string
      tripCount: number
      totalDuration: number
      avgDuration: number
    }>
  } = $props()

  let chartContainer: HTMLDivElement | undefined = undefined
  let chart: echarts.ECharts | null = $state(null)
  let isMounted = $state(false)

  const lineColors: Record<string, string> = {
    '1号线': '#E53935', '2号线': '#1A5CD6', '3号线': '#FB8C00',
    '4号线': '#43A047', '5号线': '#8E24AA', '6号线': '#00ACC1',
    '7号线': '#F4511E', '8号线': '#6D4C41', '9号线': '#5E35B1',
    '10号线': '#00897B', '13号线': '#FF8F00', '其他': '#757575',
  }

  function getLineColor(line: string, type: string): string {
    if (type === 'bus') return '#FB8C00'
    return lineColors[line] || '#1A5CD6'
  }

  function getMaxValues() {
    if (data.length === 0) return { maxCount: 1, maxDuration: 1, maxAvg: 1 }
    return {
      maxCount: Math.max(...data.map(d => d.tripCount), 1),
      maxDuration: Math.max(...data.map(d => d.totalDuration), 1),
      maxAvg: Math.max(...data.map(d => d.avgDuration), 1),
    }
  }

  function updateChart() {
    if (!chart || data.length === 0) return

    const { maxCount, maxAvg } = getMaxValues()

    const chartData = data.map(item => {
      const size = 30 + (item.tripCount / maxCount) * 50
      return [
        item.avgDuration,
        item.tripCount,
        size,
        item.line,
        item.type,
        item.totalDuration,
      ]
    })

    const option: echarts.EChartsOption = {
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
          const d = params.data
          return `<div style="font-weight: 600; margin-bottom: 6px;">${d[3]} ${d[4] === 'bus' ? '(公交)' : '(地铁)'}</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: #666;">出行次数:</span>
                <span style="font-weight: 600;">${d[1]}次</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: #666;">总时长:</span>
                <span style="font-weight: 600;">${d[5]}分钟</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: #666;">平均时长:</span>
                <span style="font-weight: 600;">${d[0].toFixed(1)}分钟</span>
              </div>
            </div>`
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '平均时长(分钟)',
        nameTextStyle: {
          color: '#999',
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
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
      yAxis: {
        type: 'value',
        name: '出行次数',
        nameTextStyle: {
          color: '#999',
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
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
      series: [
        {
          type: 'scatter',
          symbolSize: (data: any) => data[2],
          data: chartData.map((item, index) => ({
            value: item,
            itemStyle: {
              color: getLineColor(String(item[3]), String(item[4])),
              opacity: 0.75,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            },
            emphasis: {
              itemStyle: {
                opacity: 1,
                shadowBlur: 15,
                shadowColor: 'rgba(0, 0, 0, 0.25)',
                borderWidth: 2,
                borderColor: '#fff',
              },
            },
          })),
          label: {
            show: true,
            formatter: (params: any) => params.data.value[3],
            position: 'top',
            fontSize: 11,
            color: '#333',
            fontWeight: 500,
          },
          animationDuration: 1000,
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 50,
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
      data
      updateChart()
    }
  })
</script>

<div class="chart-wrapper">
  {#if data.length === 0}
    <div class="empty-chart">暂无数据</div>
  {:else}
    <div bind:this={chartContainer} class="chart-container"></div>
  {/if}
</div>

<style>
  .chart-wrapper {
    width: 100%;
    height: 300px;
    position: relative;
  }

  .chart-container {
    width: 100%;
    height: 100%;
  }

  .empty-chart {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 14px;
  }
</style>
