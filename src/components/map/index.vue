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
let map = null
let marker = null

onMounted(async () => {
  await loadMap()
  await nextTick()
  initMap()
})

// 加载地图 + 插件（正确方式！）
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

  // ✅ 正确加载插件（修复 Geocoder 报错）
  AMap.plugin(['AMap.Geocoder'], () => {
    window.geocoder = new AMap.Geocoder({ city: '全国' })
  })

  // ✅ 标记点（不偏移 + 可拖拽）
  marker = new AMap.Marker({
    position: props.center,
    anchor: 'bottom-center',
    draggable: true
  })
  map.add(marker)

  // ✅ 点击地图选点
  map.on('click', (e) => {
    const pos = [e.lnglat.lng, e.lnglat.lat]
    marker.setPosition(pos)
    emit('mapClick', pos)
  })

  // ✅ 拖拽结束
  marker.on('dragend', (e) => {
    const pos = [e.lnglat.lng, e.lnglat.lat]
    emit('marker-added', pos)
  })
}

// ✅ 搜索：回车直接定位，不显示列表
function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword || !window.geocoder) return

  geocoder.getLocation(keyword, (status, result) => {
    if (status === 'complete' && result.info === 'OK') {
      const location = result.geocodes[0].location
      const pos = [location.lng, location.lat]

      marker.setPosition(pos)
      map.setCenter(pos)
      map.setZoom(16)
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
</style>
