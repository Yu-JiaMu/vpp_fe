<template>
  <div class="bg-white rounded-md h-[405px] p-4">
    <div ref="chartRef" class="bg-white rounded-md w-full h-full"></div>
  </div>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { onMounted, ref, onBeforeUnmount } from 'vue'

  const chartRef = ref(null)
  let chartInstance = null
  const rawData = [
    { name: '网关设备', online: 60, offline: 40 },
    { name: '网关子设备', online: 120, offline: 80 },
    { name: '直连设备', online: 90, offline: 50 }
  ]

  const transformData = (data) => {
    const categories = ['', '', '']
    const online = [null, null, null]
    const offline = [null, null, null]

    data.forEach((item, index) => {
      // const targetIndex = index * 2 + 1 // 间隔一个空位
      // const targetIndex = index + 1
      const targetIndex = index
      if (targetIndex < 3) {
        categories[targetIndex] = item.name
        online[targetIndex] = item.online
        offline[targetIndex] = item.offline
      }
    })

    return { categories, online, offline }
  }

  const renderChart = () => {
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value)
    }

    const { categories, online, offline } = transformData(rawData)

    const option = {
      legend: {
        bottom: 0,
        data: [
          { name: '在线', itemStyle: { color: '#1464EE' } },
          { name: '离线', itemStyle: { color: '#D4D7DF' } }
        ]
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true
        },
        axisLabel: {
          interval: 0,
          formatter: function (value) {
            return value === '' ? '' : value
          }
        }
      },
      yAxis: {
        type: 'value'
      },

      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove|click',
        axisPointer: {
          type: 'shadow'
        },
        showContent: true,
        formatter: (params) => {
          const valid = params.filter((p) => p.value !== null && p.value !== undefined)
          if (!valid.length) return null
          let str = `${valid[0].name}<br/>`
          valid.forEach((p) => {
            str += `${p.marker} ${p.seriesName}: ${p.value}<br/>`
          })
          return str
        }
      },
      series: [
        {
          name: '在线',
          type: 'bar',
          data: online,
          barWidth: 20,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(20, 100, 238, 1)' },
              { offset: 1, color: 'rgba(20, 100, 238, 0.2)' }
            ])
          }
        },
        {
          name: '离线',
          type: 'bar',
          data: offline,
          barWidth: 20,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(212,215,223,1)' },
              { offset: 1, color: 'rgba(212,215,223,0.4)' }
            ])
          }
        }
      ]
    }

    chartInstance.setOption(option)
  }

  onMounted(() => {
    chartInstance = echarts.init(chartRef.value)

    renderChart()

    window.addEventListener('resize', resize)
  })

  const resize = () => {
    chartInstance?.resize()
  }

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chartInstance?.dispose()
  })
</script>
