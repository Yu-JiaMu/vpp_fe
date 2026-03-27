<template>
  <div class="relative w-full h-[360px] border border-[#ebecf1] overflow-hidden">
    <!-- 地图容器 -->
    <div id="map" class="w-full h-full"></div>

    <!-- 弹层 -->
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
  import { useRouter } from 'vue-router'
  import { debounce } from 'lodash-es'
  import SimpleAMapService from '@/utils/map/index'
  import DeviceMapInfoCard from './DeviceMapInfoCard.vue'

  const router = useRouter()
  const amapService = new SimpleAMapService()

  let map = null
  let markers = []

  // 当前选中
  const active = ref(false)
  const currentData = ref(null)
  const cardStyle = ref({})

  const fetchData = debounce(async () => {
    if (!map) return

    const bounds = map.getBounds()

    const params = {
      minLng: bounds.getSouthWest().lng,
      minLat: bounds.getSouthWest().lat,
      maxLng: bounds.getNorthEast().lng,
      maxLat: bounds.getNorthEast().lat
    }

    // 👉 mock接口（你替换成真实接口）
    const list = await mockApi(params)

    renderMarkers(list)
  }, 300)

  const renderMarkers = (list) => {
    // 清空旧点
    markers.forEach((m) => m.setMap(null))
    markers = []

    list.forEach((item) => {
      const marker = new window.AMap.Marker({
        position: item.lnglat,
        offset: new window.AMap.Pixel(-10, -10),
        content: createMarkerDOM(item)
      })

      marker.on('click', (e) => {
        // e.stopPropagation()
        handleClick(item, marker)
      })

      map.add(marker)
      markers.push(marker)
    })
  }

  const createMarkerDOM = (item) => {
    const div = document.createElement('div')

    div.innerHTML = `
    <div class="w-3 h-5"> <img class="w-full h-full object-contain" src="https://power-market-b4a3.obs.cn-east-3.myhuaweicloud.com/message/guanwang/icon-marker-cyan.png"/></div>
  `

    return div
  }

  const updateCardPosition = (lnglat) => {
    if (!map || !lnglat) return

    const pixel = map.lngLatToContainer(lnglat)

    cardStyle.value = {
      left: pixel.x + 18 + 'px',
      top: pixel.y - 20 + 'px'
    }
  }

  const handleClick = (item, marker) => {
    updateCardPosition(marker.getPosition())

    currentData.value = item
    active.value = true
  }

  // ========================
  // mock接口（你替换）
  // ========================
  const mockApi = async (params) => {
    // console.log(params)

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
      {
        lnglat: [104.07, 30.66],
        name: '设备2',
        productName: '测试产品B',
        nodeType: 'gateway-sub-device',
        devState: 'offLine',
        address: '成都高新区2号',
        id: '2034160071931465731'
      }
    ]
  }

  let handleMapMove = null
  onMounted(async () => {
    map = await amapService.createMap('map')

    fetchData()

    // 监听地图变化
    map.on('moveend', fetchData)
    map.on('zoomend', fetchData)

    // 点击地图关闭弹层
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
    map?.off('zoomend', fetchData)
    map?.off('mapmove', handleMapMove)
    amapService.destroy()
  })
</script>
