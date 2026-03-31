<template>
  <div class="relative w-full h-[360px] border border-[#ebecf1] overflow-hidden">
    <div id="map" class="w-full h-full"></div>

    <DeviceMapInfoCard
      v-if="active"
      :data="currentData"
      :style="cardStyle"
      @close="active = false"
      @detail="handleDetail"
    />
  </div>
</template>

<script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import { debounce, cloneDeep } from 'lodash-es'
  import { useRouter } from 'vue-router'
  import SimpleAMapService from '@/utils/map/index'
  import DeviceMapInfoCard from './DeviceMapInfoCard.vue'
  import { generateMockDevicesAdvanced } from './deviceMapMock'

  const router = useRouter()

  const amapService = new SimpleAMapService({
    plugins: ['AMap.MarkerCluster']
  })

  let map = null

  let cluster = null
  let massMarks = null
  let markers = []

  let currentList = []
  let markersInited = false

  const active = ref(false)
  const currentData = ref(null)
  const cardStyle = ref({})

  const _renderClusterMarker = function (context) {
    const count = currentList.length
    var factor = Math.pow(context.count / count, 1 / 18)
    var div = document.createElement('div')
    var Hue = 180 - factor * 180
    var bgColor = 'hsla(' + Hue + ',100%,40%,0.7)'
    var fontColor = 'hsla(' + Hue + ',100%,90%,1)'
    var borderColor = 'hsla(' + Hue + ',100%,40%,1)'
    var shadowColor = 'hsla(' + Hue + ',100%,90%,1)'
    div.style.backgroundColor = bgColor
    var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20)
    div.style.width = div.style.height = size + 'px'
    div.style.border = 'solid 1px ' + borderColor
    div.style.borderRadius = size / 2 + 'px'
    div.style.boxShadow = '0 0 5px ' + shadowColor
    div.innerHTML = context.count
    div.style.lineHeight = size + 'px'
    div.style.color = fontColor
    div.style.fontSize = '14px'
    div.style.textAlign = 'center'
    context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2))
    context.marker.setContent(div)
  }

  // 初始化
  const initCluster = () => {
    cluster = new AMap.MarkerCluster(map, cloneDeep(currentList), {
      gridSize: 60,
      renderClusterMarker: _renderClusterMarker
    })
    cluster.on('click', (e) => {
      const pos = e.marker.getPosition()
      map.setZoomAndCenter(map.getZoom() + 2, pos)
    })
  }

  const initMass = () => {
    massMarks = new AMap.MassMarks(currentList, {
      zIndex: 5,
      zooms: [3, 20],
      style: [
        {
          url: 'https://power-market-b4a3.obs.cn-east-3.myhuaweicloud.com/message/guanwang/icon-marker-cyan.png',
          size: new AMap.Size(12, 20),
          anchor: new AMap.Pixel(10, 10)
        }
      ]
    })

    massMarks.on('click', (e) => {
      handleClick(e.data, e.data.lnglat)
    })
  }

  const initMarkers = () => {
    if (markersInited) return
    markersInited = true

    const batchSize = 200
    let index = 0

    const addBatch = () => {
      if (index >= currentList.length) return

      const slice = currentList.slice(index, index + batchSize)

      slice.forEach((item) => {
        const marker = new AMap.Marker({
          position: item.lnglat,
          offset: new AMap.Pixel(-10, -10),
          content: createMarkerDOM()
        })

        marker.on('click', () => {
          handleClick(item, marker.getPosition())
        })

        markers.push(marker)
      })

      index += batchSize
      requestAnimationFrame(addBatch)
    }

    addBatch()
  }

  // 数据变了
  const rebuildLayers = () => {
    // 只销毁实例，不动数据源
    cluster?.setMap(null)
    massMarks?.setMap(null)
    markers.forEach((m) => m.setMap(null))

    cluster = null
    massMarks = null
    markers = []
    markersInited = false

    initCluster()
    initMass()
  }

  // zoom 控制
  const updateVisibleLayer = () => {
    const zoom = map.getZoom()
    console.log('zoom', zoom)

    if (zoom < 10) {
      cluster?.setData(cloneDeep(currentList))
      cluster?.setMap(map)
      massMarks?.setMap(null)
      markers.forEach((m) => m.setMap(null))
    } else if (zoom < 15) {
      massMarks?.setData(currentList)
      cluster?.setMap(null)
      massMarks?.setMap(map)
      markers.forEach((m) => m.setMap(null))
    } else {
      cluster?.setMap(null)
      massMarks?.setMap(null)

      initMarkers()
      markers.forEach((m) => m.setMap(map))
    }
  }

  // 点击
  const handleClick = (item, lnglat) => {
    updateCardPosition(lnglat)
    currentData.value = item
    active.value = true
  }

  // 跳转详情
  const handleDetail = () => {
    if (!currentData.value) return
    router.push({
      name: 'DeviceDetail',
      query: { id: currentData.value.id }
    })
  }

  // UI
  const updateCardPosition = (lnglat) => {
    const pixel = map.lngLatToContainer(lnglat)
    cardStyle.value = {
      left: pixel.x + 18 + 'px',
      top: pixel.y - 20 + 'px'
    }
  }

  const createMarkerDOM = () => {
    const div = document.createElement('div')
    div.innerHTML = `
    <div class="w-3 h-5">
      <img class="w-full h-full"
      src="https://power-market-b4a3.obs.cn-east-3.myhuaweicloud.com/message/guanwang/icon-marker-cyan.png"/>
    </div>
  `
    return div
  }

  // 数据
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

    rebuildLayers()
    updateVisibleLayer()
  }, 300)

  const mockApi = async () => {
    return generateMockDevicesAdvanced(500)
  }
  let handleMapMove = null
  onMounted(async () => {
    map = await amapService.createMap('map')

    fetchData()

    // map.on('moveend', fetchData)
    map.on('zoomend', updateVisibleLayer)

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
    map?.off('zoomend', updateVisibleLayer)
    map?.off('mapmove', handleMapMove)

    cluster?.off('click')
    massMarks?.off('click')
    markers.forEach((m) => m.off('click'))

    amapService.destroy()
  })
</script>
