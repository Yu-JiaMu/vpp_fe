<template>
  <div class="relative w-full h-[360px] border border-[#ebecf1] overflow-hidden">
    <div id="map" class="w-full h-full"></div>

    <DeviceMapInfoCard
      v-if="active"
      :data="currentData"
      :style="cardStyle"
      @close="active = false"
    />
  </div>
</template>

<script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import { debounce } from 'lodash-es'
  import SimpleAMapService from '@/utils/map/index'
  import DeviceMapInfoCard from './DeviceMapInfoCard.vue'
  import { generateMockDevicesAdvanced } from './deviceMapMock'

  const router = useRouter()
  const amapService = new SimpleAMapService({ plugins: ['AMap.MarkerCluster'] })

  let map = null

  // 三种渲染对象
  let cluster = null
  let massMarks = null
  let markers = []

  // 当前数据缓存
  let currentList = []

  // UI状态
  const active = ref(false)
  const currentData = ref(null)
  const cardStyle = ref({})

  // 数据加载
  const fetchData = debounce(async () => {
    if (!map) return

    const bounds = map.getBounds()

    const list = await mockApi({
      minLng: bounds.getSouthWest().lng,
      minLat: bounds.getSouthWest().lat,
      maxLng: bounds.getNorthEast().lng,
      maxLat: bounds.getNorthEast().lat
    })

    currentList = list

    renderByZoom()
  }, 300)

  // 根据缩放级别切换模式
  const renderByZoom = () => {
    const zoom = map.getZoom()
    // console.log('zoom', zoom)

    clearAll()

    if (zoom < 10) {
      renderCluster()
    } else if (zoom < 14) {
      renderMass()
    } else {
      renderMarkersBatch()
    }
  }

  // 1️⃣ 点聚合
  const renderCluster = () => {
    cluster = new window.AMap.MarkerCluster(map, currentList, {
      gridSize: 60,
      renderMarker: (context) => {
        const div = document.createElement('div')
        div.className = 'cluster'
        div.innerText = context.count

        context.marker.setContent(div)
      }
    })
    cluster.on('click', (e) => {
      const marker = e.marker
      const pos = marker.getPosition()

      map.setZoomAndCenter(map.getZoom() + 2, pos, true)
    })
  }

  // 2️⃣ 海量点 MassMarks
  const renderMass = () => {
    massMarks = new window.AMap.MassMarks(currentList, {
      zIndex: 5,
      zooms: [3, 20],
      style: [
        {
          url: 'https://power-market-b4a3.obs.cn-east-3.myhuaweicloud.com/message/guanwang/icon-marker-cyan.png',
          size: new window.AMap.Size(12, 20),
          anchor: new window.AMap.Pixel(6, 20)
        }
      ]
    })

    massMarks.setMap(map)

    massMarks.on('click', (e) => {
      // console.log('renderMass', e.data, e)
      handleClick(e.data, e.data.lnglat)
    })
  }

  // 3️⃣ 分批 Marker（解决卡顿）
  const renderMarkersBatch = () => {
    const batchSize = 200
    let index = 0

    const addBatch = () => {
      if (index >= currentList.length) return

      const slice = currentList.slice(index, index + batchSize)

      slice.forEach((item) => {
        const marker = new window.AMap.Marker({
          position: item.lnglat,
          offset: new window.AMap.Pixel(-10, -10),
          content: createMarkerDOM()
        })

        marker.on('click', () => handleClick(item, marker.getPosition()))

        map.add(marker)
        markers.push(marker)
      })

      index += batchSize

      requestAnimationFrame(addBatch) // 👉不卡UI关键
    }

    addBatch()
  }

  // 工具函数

  const clearAll = () => {
    cluster?.setMap(null)
    cluster = null

    massMarks?.setMap(null)
    massMarks = null

    markers.forEach((m) => m.setMap(null))
    markers = []
  }

  const createMarkerDOM = () => {
    const div = document.createElement('div')
    div.innerHTML = `
    <div class="w-3 h-5">
      <img class="w-full h-full object-contain"
      src="https://power-market-b4a3.obs.cn-east-3.myhuaweicloud.com/message/guanwang/icon-marker-cyan.png"/>
    </div>
  `
    return div
  }

  // 点击 & 弹层

  const handleClick = (item, lnglat) => {
    updateCardPosition(lnglat)
    currentData.value = item
    active.value = true
  }

  const updateCardPosition = (lnglat) => {
    const pixel = map.lngLatToContainer(lnglat)

    cardStyle.value = {
      left: pixel.x + 18 + 'px',
      top: pixel.y - 20 + 'px'
    }
  }

  // mock数据

  const mockApi = async () => {
    return [
      {
        lnglat: [104.08392, 30.389842],
        name: '设备1',
        productName: '测试产品A',
        nodeType: 'gateway-sub-device',
        devState: 'onLine',
        address: '成都高新区1号',
        id: '2034160071931465729'
      },
      ...generateMockDevicesAdvanced(500) // 👉 1w+
    ]
  }

  // 生命周期

  let handleMapMove = null

  onMounted(async () => {
    map = await amapService.createMap('map')

    fetchData()

    // map.on('moveend', fetchData)
    map.on('zoomend', renderByZoom)

    map.on('click', () => {
      active.value = false
    })

    handleMapMove = () => {
      if (!active.value || !currentData.value) return
      updateCardPosition(currentData.value.lnglat)
    }

    map.on('mapmove', handleMapMove)
  })

  onBeforeUnmount(() => {
    map?.off('moveend', fetchData)
    map?.off('zoomend', renderByZoom)
    map?.off('mapmove', handleMapMove)
    amapService.destroy()
  })
</script>
