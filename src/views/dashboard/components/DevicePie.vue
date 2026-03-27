<template>
  <div class="relative bg-white rounded-md h-[405px] p-4">
    <div ref="chartRef" class="bg-white rounded-md w-full h-full relative z-10"></div>
  </div>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { onMounted, ref, onBeforeUnmount } from 'vue'

  const chartRef = ref(null)
  let chartInstance = null

  const data = [
    { name: '电表计量表', value: 10 },
    { name: '断路器', value: 20 },
    { name: '三相电表', value: 30 },
    { name: '四方子设备', value: 40 },
    { name: '逆变器', value: 15 },
    { name: '智能断路器', value: 25 },
    { name: '接地电流检测器', value: 5 },
    { name: '设备', value: 12 },
    { name: '其他', value: 8 }
  ]

  onMounted(() => {
    chartInstance = echarts.init(chartRef.value)

    chartInstance.setOption({
      color: [
        '#47EF8F',
        '#2dd4bf',
        '#2c95ff',
        '#2c72ff',
        '#584df2',
        '#9250f6',
        '#f83b82',
        '#fe652b',
        '#febe2b',
        '#f6ea43'
      ],
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: 0
        // itemWidth: 12,
        // itemHeight: 4
        // textStyle: {
        //   fontSize: 12,
        //   lineHeight: 12, // 👈 和字体一致
        //   padding: [8, 0, 0, 0] // 👈 微调间距（关键）
        // }
      },
      series: [
        /*  {
          type: 'pie',
          radius: ['65%', '75%'],
          center: ['50%', '45%'],
          silent: true, // ❗不响应鼠标事件
          label: { show: false },
          data: [
            {
              value: 100,
              itemStyle: {
                color: new echarts.graphic.RadialGradient(
                  0.5,
                  0.5,
                  1, // 👈 中心点 + 半径
                  [
                    { offset: 0, color: 'red' }, // 内
                    { offset: 1, color: '#F5F5F8' } // 外
                  ]
                )
              }
            }
          ],
          z: 1
        }, */
        {
          type: 'pie',
          radius: ['40%', '60%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,

          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)'
          },
          data
        }
      ],
      graphic: [
        {
          type: 'circle',
          left: 'center',
          top: '29%', // 👈 跟 center 对齐
          shape: {
            r: 60 // 👈 半径（自己调）
          },
          style: {
            fill: '#fff',
            shadowBlur: 15,
            shadowColor: 'rgba(0,0,0,0.15)',
            shadowOffsetY: 3
          },
          z: 10
        }
      ]
    })

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
