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

    <div v-if="currentPosition" class="marker-info">
      <div class="info-content">
        <h4>当前位置</h4>
        <p>{{ currentAddress || '未命名位置' }}</p>
        <p>坐标: {{ currentPosition[0].toFixed(6) }}, {{ currentPosition[1].toFixed(6) }}</p>
      </div>
    </div>

    <div v-if="searchResults.length > 0" class="results-panel">
      <div class="results-header">
        <span>搜索结果 ({{ searchResults.length }})</span>
        <button @click="clearSearch" class="clear-btn">清空</button>
      </div>
      <div class="results-list">
        <div
          v-for="(result, index) in searchResults"
          :key="index"
          class="result-item"
          @click="selectResult(result)"
        >
          <div class="result-name">{{ result.name }}</div>
          <div class="result-address">{{ result.address }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  center: {
    type: Array,
    default: () => [104.065735, 30.659462]
  },
  zoom: {
    type: Number,
    default: 12
  }
})

const emit = defineEmits(['marker-added'])

const AMAP_KEY = 'a9f1840ab6ebfb81e17f611ca72572d2'
const mapId = `amap-container-${Math.random().toString(36).substr(2, 9)}`

const searchKeyword = ref('')
const searchResults = ref([])
const currentPosition = ref(null)
const currentAddress = ref('')

let map = null
let marker = null
let placeSearch = null
let geocoder = null

onMounted(async () => {
  await ensureAMap()
  await nextTick()
  initMap()
})

function ensureAMap() {
  return new Promise((resolve) => {
    if (window.AMap) return resolve()
    window._AMapSecurityConfig = {
      securityJsCode: '7802773fa3f2803231ffa8bf22b568eb'
    }
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.PlaceSearch,AMap.Geocoder`
    script.async = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

function initMap() {
  map = new AMap.Map(mapId, {
    zoom: props.zoom,
    center: props.center,
    viewMode: '2D',
    features: ['bg', 'road', 'building', 'point'],
    showIndoorMap: false,
    resizeEnable: true,
    zoomEnable: true,
    dragEnable: true
  })
  map.addControl(new AMap.ToolBar({ position: 'RB' }))
  map.addControl(new AMap.Scale({ position: 'LB' }))

  // 创建单个可拖拽标记（始终可见）
  marker = new AMap.Marker({
    position: props.center,
    draggable: true,
    offset: new AMap.Pixel(-13, -30)
  })
  map.add(marker)

  currentPosition.value = props.center

  // 初始化地理编码插件
  geocoder = new AMap.Geocoder({ city: '全国' })

  // 点击地图 → 移动标记到点击位置
  map.on('click', (e) => {
    const lnglat = [e.lnglat.getLng(), e.lnglat.getLat()]
    moveMarker(lnglat)
  })

  // 拖拽标记
  marker.on('dragend', (e) => {
    const lnglat = [e.lnglat.getLng(), e.lnglat.getLat()]
    currentPosition.value = lnglat
    reverseGeocode(lnglat)
    emit('marker-added', { position: lnglat })
  })

  // 首次进入也获取地址描述
  reverseGeocode(props.center)
}

function moveMarker(lnglat) {
  marker.setPosition(lnglat)
  map.setCenter(lnglat)
  currentPosition.value = lnglat

  reverseGeocode(lnglat)
  emit('marker-added', { position: lnglat })
}

function reverseGeocode(lnglat) {
  if (!geocoder) return
  geocoder.getAddress(lnglat, (status, result) => {
    if (status === 'complete' && result.info === 'OK') {
      currentAddress.value = result.regeocode.formattedAddress
    }
  })
}

// 搜索
function handleSearch() {
  if (!searchKeyword.value.trim()) return
  AMap.plugin('AMap.PlaceSearch', () => {
    if (!placeSearch) {
      placeSearch = new AMap.PlaceSearch({
        pageSize: 20,
        pageIndex: 1,
        city: '成都',
        citylimit: true
      })
    }
    placeSearch.search(searchKeyword.value, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        searchResults.value = result.poiList.pois
      }
    })
  })
}

function selectResult(result) {
  const lnglat = [result.location.lng, result.location.lat]
  moveMarker(lnglat)
  map.setZoom(15)
  currentAddress.value = result.address || result.name
  clearSearch()
}

function clearSearch() {
  searchKeyword.value = ''
  searchResults.value = []
}

// 公开方法
function getCurrentPosition() {
  return currentPosition.value
}
function setCenter(lnglat) {
  map?.setCenter(lnglat)
}
function setZoom(z) {
  map?.setZoom(z)
}

defineExpose({ getCurrentPosition, setCenter, setZoom })

onUnmounted(() => {
  map?.destroy()
})
</script>

<style scoped>
.amap-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.map-header {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  white-space: nowrap;
}

.search-container {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.location-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: all 0.3s;
}

.location-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-button {
  padding: 10px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.search-button:hover {
  background: #40a9ff;
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
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 300px;
  min-width: 200px;
}

.info-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1890ff;
  font-weight: 600;
}

.info-content p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.results-panel {
  position: absolute;
  top: 100px;
  left: 20px;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
}

.clear-btn {
  padding: 4px 12px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background: #f78989;
}

.results-list {
  max-height: 350px;
  overflow-y: auto;
  padding: 8px 0;
}

.result-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background: #f5f7fa;
}

.result-item:last-child {
  border-bottom: none;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.result-address {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
