// utils/simple-amap.js
const key = `a9f1840ab6ebfb81e17f611ca72572d2`
const securityJsCode = `522054ec0e1ef9da651e7975e9235abf`
class SimpleAMapService {
  constructor(options = {}) {
    this.options = {
      key: key || options.key || '',
      securityJsCode: securityJsCode || options.securityJsCode || '',
      version: options.version || '2.0',
      ...options
    }

    this.AMap = null
    this.map = null
    this.loaded = false
  }

  // 加载高德地图API
  async loadAMapAPI() {
    if (this.loaded) return this.AMap

    return new Promise((resolve, reject) => {
      // 安全配置
      if (this.options.securityJsCode) {
        window._AMapSecurityConfig = {
          securityJsCode: this.options.securityJsCode
        }
      }

      // 检查是否已加载
      if (window.AMap) {
        this.AMap = window.AMap
        this.loaded = true
        resolve(this.AMap)
        return
      }

      // 动态加载
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = 'https://webapi.amap.com/loader.js'

      script.onload = () => {
        AMapLoader.load({
          key: this.options.key,
          version: this.options.version
        })
          .then((AMap) => {
            this.AMap = AMap
            this.loaded = true
            resolve(AMap)
          })
          .catch(reject)
      }

      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // 创建地图
  async createMap(containerId, options = {}) {
    await this.loadAMapAPI()

    this.map = new this.AMap.Map(containerId, {
      zoom: 12,
      center: [104.065735, 30.659462], // 成都中心坐标
      viewMode: '2D',
      mapStyle: 'amap://styles/normal',
      zoomEnable: true,
      dragEnable: true,
      ...options
    })

    return this.map
  }

  // 搜索地点
  async searchPlaces(keyword, city = '成都') {
    if (!this.AMap) {
      await this.loadAMapAPI()
    }

    return new Promise((resolve, reject) => {
      this.AMap.plugin('AMap.PlaceSearch', () => {
        const placeSearch = new this.AMap.PlaceSearch({
          pageSize: 20,
          pageIndex: 1,
          city: city,
          citylimit: true
        })

        placeSearch.search(keyword, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            resolve(result.poiList.pois)
          } else {
            reject(new Error('搜索失败'))
          }
        })
      })
    })
  }

  // 添加标记
  addMarker(lnglat, title = '', options = {}) {
    if (!this.map) return null

    const marker = new this.AMap.Marker({
      position: lnglat,
      title: title,
      ...options
    })

    this.map.add(marker)

    // 添加信息窗口
    if (title) {
      const infoWindow = new this.AMap.InfoWindow({
        content: `<div class="marker-info">${title}</div>`,
        offset: new this.AMap.Pixel(0, -30)
      })

      marker.on('click', () => {
        infoWindow.open(this.map, marker.getPosition())
      })
    }

    return marker
  }

  // 清空标记
  clearMarkers() {
    if (this.map) {
      this.map.clearMap()
    }
  }

  // 定位到指定坐标
  setCenter(lnglat) {
    if (this.map) {
      this.map.setCenter(lnglat)
    }
  }
}
