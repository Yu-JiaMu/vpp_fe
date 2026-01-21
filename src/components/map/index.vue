<!-- components/AmapComponent.vue -->
<template>
  <div class="amap-wrapper">
    <!-- 地图头部 - 完全按照图片设计 -->
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

    <!-- 地图容器 -->
    <div :id="mapId" class="map-container"></div>

    <!-- 地图标记信息 -->
    <div v-if="currentMarker" class="marker-info">
      <div class="info-content">
        <h4>当前位置</h4>
        <p>{{ currentMarker.address || '未命名位置' }}</p>
        <p
          >坐标: {{ currentMarker.position[0].toFixed(6) }},
          {{ currentMarker.position[1].toFixed(6) }}</p
        >
      </div>
    </div>

    <!-- 搜索结果面板 -->
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
  import {
    ref,
    onMounted,
    onUnmounted,
    nextTick,
    defineExpose,
    defineEmits,
    defineProps,
    watch
  } from 'vue'

  // 定义 Props
  const props = defineProps({
    // 地图配置
    center: {
      type: Array,
      default: () => [104.065735, 30.659462] // 成都中心坐标
    },
    zoom: {
      type: Number,
      default: 12
    },
    // 标记点
    markers: {
      type: Array,
      default: () => []
    },
    // 是否显示搜索结果面板
    showResults: {
      type: Boolean,
      default: true
    },
    // 是否可点击添加标记
    clickable: {
      type: Boolean,
      default: true
    }
  })

  // 定义事件
  const emit = defineEmits(['init', 'click', 'search', 'marker-added', 'marker-clicked'])

  // 地图配置
  const AMAP_KEY = 'a9f1840ab6ebfb81e17f611ca72572d2'
  const AMAP_SECURITY_CODE = '522054ec0e1ef9da651e7975e9235abf'

  // 生成唯一的地图ID
  const mapId = `amap-container-${Math.random().toString(36).substr(2, 9)}`

  // 响应式数据
  const searchKeyword = ref('')
  const searchResults = ref([])
  const currentMarker = ref(null)
  const markers = ref([])
  const mapInstance = ref(null)
  const AMap = ref(null)

  // 成都主要地标（根据图片内容）
  const chengduLandmarks = [
    { name: '成都站', lnglat: [104.068, 30.697], type: 'station' },
    { name: '成都东站', lnglat: [104.145, 30.631], type: 'station' },
    { name: '成都西站', lnglat: [103.955, 30.699], type: 'station' },
    { name: '郫都区', lnglat: [103.884, 30.808], type: 'district' },
    { name: '温江区', lnglat: [103.856, 30.69], type: 'district' },
    { name: '青羊区', lnglat: [104.063, 30.668], type: 'district' },
    { name: '武侯区', lnglat: [104.043, 30.633], type: 'district' },
    { name: '成华区', lnglat: [104.103, 30.66], type: 'district' },
    { name: '锦城湖', lnglat: [104.055, 30.575], type: 'park' },
    { name: '青龙湖湿地公园', lnglat: [104.185, 30.657], type: 'park' },
    { name: '九里堤街道', lnglat: [104.038, 30.71], type: 'street' },
    { name: '文家街道', lnglat: [103.922, 30.695], type: 'street' },
    { name: '府南街道', lnglat: [104.038, 30.668], type: 'street' },
    { name: '永宁街道', lnglat: [103.828, 30.683], type: 'street' },
    { name: '万家湾枢纽站', lnglat: [103.982, 30.668], type: 'station' },
    { name: '鹿浦立交', lnglat: [104.118, 30.718], type: 'road' },
    { name: '凤凰立交', lnglat: [104.085, 30.628], type: 'road' },
    { name: '靖江', lnglat: [103.998, 30.633], type: 'area' },
    { name: '马家场', lnglat: [103.978, 30.718], type: 'area' }
  ]

  // 初始化地图
  const initMap = async () => {
    try {
      // 加载高德地图安全配置
      window._AMapSecurityConfig = {
        securityJsCode: AMAP_SECURITY_CODE
      }

      // 动态加载高德地图API
      if (!window.AMap) {
        await loadAMapAPI()
      }

      AMap.value = window.AMap

      // 等待DOM渲染完成
      await nextTick()

      // 创建地图实例
      mapInstance.value = new AMap.value.Map(mapId, {
        zoom: props.zoom,
        center: props.center,
        viewMode: '2D',
        mapStyle: 'amap://styles/light', // 使用浅色主题
        features: ['bg', 'road', 'building', 'point'],
        showIndoorMap: false,
        resizeEnable: true,
        zoomEnable: true,
        dragEnable: true
      })

      // 添加缩放控件
      mapInstance.value.addControl(
        new AMap.value.ToolBar({
          position: 'RB'
        })
      )

      // 添加比例尺
      mapInstance.value.addControl(
        new AMap.value.Scale({
          position: 'LB'
        })
      )

      // 添加默认标记
      addDefaultMarkers()

      // 添加外部传入的标记
      props.markers.forEach((marker) => {
        addMarker(marker.lnglat, marker.name, marker.type)
      })

      // 地图点击事件
      if (props.clickable) {
        mapInstance.value.on('click', handleMapClick)
      }

      // 触发初始化完成事件
      emit('init', mapInstance.value)

      console.log('高德地图初始化完成')
    } catch (error) {
      console.error('地图初始化失败:', error)
    }
  }

  // 加载高德地图API
  const loadAMapAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.PlaceSearch,AMap.Geocoder,AMap.DistrictSearch`

      script.onload = () => {
        resolve()
      }

      script.onerror = (error) => {
        reject(new Error('高德地图API加载失败'))
      }

      document.head.appendChild(script)
    })
  }

  // 添加默认标记
  const addDefaultMarkers = () => {
    chengduLandmarks.forEach((landmark) => {
      addMarker(landmark.lnglat, landmark.name, landmark.type)
    })
  }

  // 添加标记
  const addMarker = (lnglat, title, type = 'default') => {
    if (!mapInstance.value || !AMap.value) return null

    // 根据类型设置不同的颜色
    const colors = {
      station: '#f56c6c', // 红色 - 车站
      district: '#e6a23c', // 橙色 - 行政区
      park: '#67c23a', // 绿色 - 公园
      street: '#409eff', // 蓝色 - 街道
      road: '#909399', // 灰色 - 道路
      area: '#722ed1', // 紫色 - 区域
      default: '#1890ff' // 蓝色 - 默认
    }

    const color = colors[type] || colors.default

    const marker = new AMap.value.Marker({
      position: lnglat,
      title: title,
      offset: new AMap.value.Pixel(-13, -30)
    })

    // 创建自定义图标
    const icon = new AMap.value.Icon({
      size: new AMap.value.Size(30, 30),
      image: createMarkerIcon(color),
      imageSize: new AMap.value.Size(30, 30)
    })

    marker.setIcon(icon)

    // 信息窗口
    const infoWindow = new AMap.value.InfoWindow({
      content: `<div class="marker-info-window">
      <h4>${title}</h4>
      <p>坐标: ${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)}</p>
      <p>类型: ${type}</p>
    </div>`,
      offset: new AMap.value.Pixel(0, -30)
    })

    // 点击标记显示信息窗口
    marker.on('click', () => {
      infoWindow.open(mapInstance.value, marker.getPosition())
      emit('marker-clicked', { title, position: lnglat, type })
    })

    mapInstance.value.add(marker)
    markers.value.push(marker)

    return marker
  }

  // 创建标记图标
  const createMarkerIcon = (color) => {
    const size = 30
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // 绘制彩色圆形
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()

    // 白色边框
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()

    return canvas.toDataURL()
  }

  // 地图点击事件
  const handleMapClick = (event) => {
    const lnglat = [event.lnglat.lng, event.lnglat.lat]

    // 反地理编码获取地址
    getAddressByLngLat(lnglat).then((address) => {
      const marker = addMarker(lnglat, address || '未命名位置', 'user')

      if (marker) {
        currentMarker.value = {
          position: lnglat,
          address: address || '未命名位置',
          marker: marker
        }

        emit('click', currentMarker.value)
        emit('marker-added', currentMarker.value)
      }
    })
  }

  // 搜索地址
  const handleSearch = async () => {
    if (!searchKeyword.value.trim()) return

    try {
      if (!AMap.value) {
        await loadAMapAPI()
      }

      AMap.value.plugin('AMap.PlaceSearch', () => {
        const placeSearch = new AMap.value.PlaceSearch({
          pageSize: 20,
          pageIndex: 1,
          city: '成都',
          citylimit: true
        })

        placeSearch.search(searchKeyword.value, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            searchResults.value = result.poiList.pois
            emit('search', searchResults.value)
          }
        })
      })
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }

  // 选择搜索结果
  const selectResult = (result) => {
    const lnglat = [result.location.lng, result.location.lat]

    // 定位到该位置
    mapInstance.value.setCenter(lnglat)
    mapInstance.value.setZoom(15)

    // 添加标记
    addMarker(lnglat, result.name, 'search')

    // 更新当前标记
    currentMarker.value = {
      position: lnglat,
      address: result.address || result.name,
      name: result.name
    }

    // 清空搜索结果
    clearSearch()
  }

  // 清除搜索
  const clearSearch = () => {
    searchKeyword.value = ''
    searchResults.value = []
  }

  // 通过坐标获取地址
  const getAddressByLngLat = (lnglat) => {
    return new Promise((resolve) => {
      if (!AMap.value) {
        resolve('')
        return
      }

      AMap.value.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.value.Geocoder()
        geocoder.getAddress(lnglat, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            resolve(result.regeocode.formattedAddress)
          } else {
            resolve('')
          }
        })
      })
    })
  }

  // 公开的方法
  const getMap = () => mapInstance.value
  const getCurrentPosition = () => currentMarker.value
  const clearMarkers = () => {
    markers.value.forEach((marker) => {
      mapInstance.value?.remove(marker)
    })
    markers.value = []
    currentMarker.value = null
  }
  const setCenter = (lnglat) => {
    mapInstance.value?.setCenter(lnglat)
  }
  const setZoom = (zoom) => {
    mapInstance.value?.setZoom(zoom)
  }
  const addCustomMarker = (lnglat, title, type = 'default') => {
    return addMarker(lnglat, title, type)
  }

  // 监听外部传入的 markers
  watch(
    () => props.markers,
    (newMarkers) => {
      // 清空现有标记
      clearMarkers()

      // 添加默认标记
      addDefaultMarkers()

      // 添加外部传入的标记
      newMarkers.forEach((marker) => {
        addMarker(marker.lnglat, marker.name, marker.type)
      })
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    initMap()
  })

  onUnmounted(() => {
    if (mapInstance.value) {
      mapInstance.value.destroy()
    }
  })

  // 暴露方法给父组件
  defineExpose({
    getMap,
    getCurrentPosition,
    clearMarkers,
    setCenter,
    setZoom,
    addCustomMarker,
    search: handleSearch
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

  /* 地图头部 - 完全按照图片设计 */
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

  /* 地图容器 */
  .map-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }

  /* 标记信息 */
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

  /* 搜索结果面板 */
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

  /* 信息窗口样式 */
  :deep(.marker-info-window) {
    padding: 8px 12px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 150px;
  }

  :deep(.marker-info-window h4) {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #1890ff;
    font-weight: 600;
  }

  :deep(.marker-info-window p) {
    margin: 0;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
</style>
