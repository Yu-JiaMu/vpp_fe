<template>
  <div class="relative bg-white rounded-md h-[360px] p-4">
    <div ref="chartRef" class="bg-white rounded-md w-full h-full relative z-10"></div>
  </div>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const chartRef = ref(null)
  let chartInstance = null

  const xData = ['11/31', '12/01', '12/02', '12/03', '12/04', '12/05']
  const upData = [8000, 9000, 11000, 8000, 17000, 13000]
  const downData = [4000, 3500, 4200, 3800, 4500, 5000]

  onMounted(() => {
    chartInstance = echarts.init(chartRef.value)

    chartInstance.setOption({
      grid: {
        left: 40,
        right: 20,
        top: 20,
        bottom: 80
      },

      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        extraCssText: 'border-radius: 8px;',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#38ECF2',
            type: 'dashed'
          }
        }
      },

      legend: {
        bottom: 0,
        itemWidth: 14,
        itemHeight: 4,
        textStyle: {
          color: '#666'
        }
      },

      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true
        }
      },

      yAxis: {
        type: 'value',
        splitNumber: 5,
        axisLine: { show: false },
        axisTick: { show: false },
        // axisLabel: { color: '#999' },
        splitLine: {
          show: true
        }
      },

      series: [
        {
          name: '上行消息数',
          type: 'line',
          smooth: true,
          data: upData,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: '#2A4DFC'
          },
          itemStyle: {
            color: '#2A4DFC'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(42,77,252,0.4)' },
              { offset: 1, color: 'rgba(59,130,246,0)' }
            ])
          }
        },
        {
          name: '下行消息数',
          type: 'line',
          smooth: true,
          data: downData,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: '#20EBE4'
          },
          itemStyle: {
            color: '#20EBE4'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(32,235,228,0.4)' },
              { offset: 1, color: 'rgba(32,235,228,0)' }
            ])
          }
        }
      ]
    })

    window.addEventListener('resize', resize)
  })

  const resize = () => {
    chartInstance && chartInstance.resize()
  }

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chartInstance && chartInstance.dispose()
  })
</script>

<style lang="scss" scoped>
  .device-message {
  }
</style>
