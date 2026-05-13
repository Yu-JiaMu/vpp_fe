<template>
  <div class="amap-wrapper">
    <div class="map-header">
      <div class="header-title">位置信息</div>
      <div class="search-container">
        <input
            v-model="searchKeyword"
            placeholder="请输入详细地址"
            class="location-input"
            @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-button">搜索</button>
      </div>
    </div>

    <div :id="mapId" class="map-container"></div>

    <!-- 右下角当前位置信息 -->
    <div v-if="currentPosition" class="marker-info">
      <div class="info-content">
        <h4>当前位置</h4>
        <p>{{ currentAddress || '未命名位置' }}</p>
        <p>坐标: {{ currentPosition[0].toFixed(6) }}, {{ currentPosition[1].toFixed(6) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  center: { type: Array, default: () => [104.065735, 30.659462] },
  zoom: { type: Number, default: 12 }
})

const emit = defineEmits(['mapClick', 'marker-added'])

const AMAP_KEY = 'a9f1840ab6ebfb81e17f611ca72572d2'
const mapId = `amap-${Math.random().toString(36).slice(2)}`

const searchKeyword = ref('')
const currentPosition = ref(null)
const currentAddress = ref('')

let map = null
let marker = null
let geocoder = null

onMounted(async () => {
  await loadMap()
  await nextTick()
  initMap()
})

function loadMap() {
  return new Promise((resolve) => {
    if (window.AMap) return resolve()

    window._AMapSecurityConfig = {
      securityJsCode: '7802773fa3f2803231ffa8bf22b568eb'
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder`
    script.onload = resolve()
    document.head.appendChild(script)
  })
}

function initMap() {
  map = new AMap.Map(mapId, {
    zoom: props.zoom,
    center: props.center,
    resizeEnable: true
  })

  AMap.plugin(['AMap.Geocoder'], () => {
    geocoder = new AMap.Geocoder({ city: '全国' })
  })

  marker = new AMap.Marker({
    position: props.center,
    anchor: 'bottom-center',
    draggable: true
  })
  map.add(marker)

  // 初始化当前位置
  currentPosition.value = props.center
  updateAddress(props.center)

  // 点击地图选点
  map.on('click', (e) => {
    const pos = [e.lnglat.lng, e.lnglat.lat]
    marker.setPosition(pos)
    currentPosition.value = pos
    updateAddress(pos)
    emit('mapClick', pos)
  })

  // 拖拽结束
  marker.on('dragend', (e) => {
    const pos = [e.lnglat.lng, e.lnglat.lat]
    currentPosition.value = pos
    updateAddress(pos)
    emit('marker-added', pos)
  })
}

function updateAddress(lnglat) {
  if (!geocoder) return
  geocoder.getAddress(lnglat, (status, result) => {
    if (status === 'complete' && result.info === 'OK') {
      currentAddress.value = result.regeocode.formattedAddress
    }
  })
}

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword || !geocoder) return

  geocoder.getLocation(keyword, (status, result) => {
    if (status === 'complete' && result.info === 'OK') {
      const location = result.geocodes[0].location
      const pos = [location.lng, location.lat]

      marker.setPosition(pos)
      map.setCenter(pos)
      map.setZoom(16)
      currentPosition.value = pos
      updateAddress(pos)
    }
  })
}

defineExpose({
  getCurrentPosition() {
    if (!marker) return null
    const pos = marker.getPosition()
    return [pos.lng, pos.lat]
  }
})
</script>

<style scoped>
.amap-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.map-header {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 999;
  background: white;
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.search-container {
  flex: 1;
  display: flex;
  gap: 6px;
}
.location-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.search-button {
  padding: 6px 12px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
}
.map-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
.marker-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  z-index: 999;
  max-width: 320px;
  min-width: 200px;
}
.info-content h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: #1890ff;
  font-weight: 600;
}
.info-content p {
  margin: 3px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}
</style>
