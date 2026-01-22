// utils/simple-amap.js
const key = 'a9f1840ab6ebfb81e17f611ca72572d2'
const securityJsCode = '522054ec0e1ef9da651e7975e9235abf'
import AMapLoader from '@amap/amap-jsapi-loader'
class SimpleAMapService {
  constructor(options = {}) {
    this.options = {
      key: key || options.key || '',
      securityJsCode: securityJsCode || options.securityJsCode || '',
      version: options.version || '2.0',
      baseUrl: 'https://webapi.amap.com',
      ...options
    }
    this.AMap = null
    this.map = null
    this.loaded = false
    this.loadingPromise = null
  }
  // 初始化安全配置
  initSecurityConfig() {
    if (this.options.securityJsCode) {
      window._AMapSecurityConfig = {
        securityJsCode: this.options.securityJsCode
      }
    }
  }
  // 加载高德地图API
  async loadAMapAPI() {
    if (this.loaded) {
      return Promise.resolve(this.AMap)
    }
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // 初始化安全配置
      this.initSecurityConfig()
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
      script.src = `${this.options.baseUrl}/loader.js`
      script.onload = () => {
        // 注意：loader.js 加载后，需要使用 AMapLoader
        if (typeof AMapLoader !== 'undefined') {
          AMapLoader.load({
            key: this.options.key,
            version: this.options.version,
            plugins: [] // 默认不加载插件
          })
            .then((AMap) => {
              this.AMap = AMap
              this.loaded = true
              window.AMap = AMap // 挂载到全局
              resolve(AMap)
            })
            .catch((error) => {
              console.error('高德地图加载失败:', error)
              reject(error)
            })
        } else {
          reject(new Error('AMapLoader 未定义，请检查脚本加载'))
        }
      }
      script.onerror = (error) => {
        console.error('高德地图脚本加载失败:', error)
        reject(new Error('高德地图API加载失败'))
      }
      document.head.appendChild(script)
    })
    return this.loadingPromise
  }
  // 创建地图
  async createMap(containerId, options = {}) {
    try {
      // 确保 API 已加载
      await this.loadAMapAPI()
      console.log(this.AMap)
      // 获取容器元素
      const container = document.getElementById(containerId)
      if (!container) {
        throw new Error(`找不到地图容器: ${containerId}`)
      }
      // 根据图片中的信息，成都中心坐标
      const defaultOptions = {
        zoom: 12,
        center: [104.065735, 30.659462], // 成都中心坐标
        viewMode: '2D',
        mapStyle: 'amap://styles/normal',
        zoomEnable: true,
        dragEnable: true,
        resizeEnable: true,
        showIndoorMap: false,
        rotateEnable: false,
        ...options
      }
      // 尝试获取当前位置作为中心点
      try {
        const location = await this.getCurrentPosition()
        if (location && location.success) {
          console.log('使用定位中心:', location.position)
          defaultOptions.center = location.position

          // 如果定位成功，调整合适的缩放级别
          if (options.zoom === undefined) {
            defaultOptions.zoom = 14 // 定位成功后显示更近的视野
          }
        }
      } catch (error) {
        console.warn('获取定位失败，使用默认中心:', error.message || error)
        // 获取定位失败，继续使用默认中心
      }
      // 创建地图实例
      this.map = new this.AMap.Map(containerId, defaultOptions)
      console.log('高德地图创建成功')
      return this.map
    } catch (error) {
      console.error('创建地图失败:', error)
      throw error
    }
  }

  // 搜索地点 - 根据图片中的"请输入搜索内容"
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
          citylimit: true,
          map: this.map, // 绑定地图
          panel: 'search-result' // 结果容器ID
        })
        placeSearch.search(keyword, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            console.log('搜索结果:', result.poiList.pois)
            resolve(result.poiList.pois)
          } else {
            reject(new Error(`搜索失败: ${result.info}`))
          }
        })
      })
    })
  }
  // 添加标记
  async addMarker(lnglat, title = '', options = {}) {
    if (!this.map) return null
    const marker = new this.AMap.Marker({
      position: lnglat,
      title: title,
      icon: options.icon || 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
      offset: new this.AMap.Pixel(-13, -30),
      ...options
    })
    this.map.add(marker)
    // 添加信息窗口
    if (title) {
      const infoWindow = new this.AMap.InfoWindow({
        content: `<div class="marker-info">
          <h4>${title}</h4>
          <p>坐标: ${lnglat[0].toFixed(6)}, ${lnglat[1].toFixed(6)}</p>
        </div>`,
        offset: new this.AMap.Pixel(0, -30)
      })
      marker.on('click', () => {
        infoWindow.open(this.map, marker.getPosition())
      })
    }
    return marker
  }
  // 添加图片中的成都地标
  addChengduLandmarks() {
    if (!this.map) return
    // 根据图片中的位置添加标记
    const landmarks = [
      { name: '郫县东站', lnglat: [103.884, 30.808], type: 'station' },
      { name: '成都站', lnglat: [104.068, 30.697], type: 'station' },
      { name: '成都东站', lnglat: [104.145, 30.631], type: 'station' },
      { name: '郫都区', lnglat: [103.884, 30.808], type: 'district' },
      { name: '青羊区', lnglat: [104.063, 30.668], type: 'district' },
      { name: '成华区', lnglat: [104.103, 30.66], type: 'district' },
      { name: '武侯区', lnglat: [104.043, 30.633], type: 'district' },
      { name: '鹿浦立交', lnglat: [104.118, 30.718], type: 'road' },
      { name: '凤凰立交', lnglat: [104.085, 30.628], type: 'road' },
      { name: '靖江', lnglat: [103.998, 30.633], type: 'area' },
      { name: '永宁街道', lnglat: [103.828, 30.683], type: 'street' },
      { name: '马家场', lnglat: [103.978, 30.718], type: 'area' },
      { name: '九江街道', lnglat: [103.955, 30.615], type: 'street' },
      { name: '九华街道', lnglat: [104.015, 30.685], type: 'street' },
      { name: '锦城湖', lnglat: [104.055, 30.575], type: 'park' },
      { name: '成渝大熊猫教育研究基地', lnglat: [104.141, 30.741], type: 'park' },
      { name: '成都南站', lnglat: [104.067, 30.605], type: 'station' }
    ]
    landmarks.forEach((landmark) => {
      this.addMarker(landmark.lnglat, landmark.name, {
        icon: this.getMarkerIcon(landmark.type)
      })
    })
  }
  // 根据类型获取不同的图标
  getMarkerIcon(type) {
    const iconMap = {
      station: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png', // 红色
      district: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_y.png', // 黄色
      road: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_g.png', // 绿色
      street: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png', // 蓝色
      area: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_p.png', // 紫色
      park: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_o.png' // 橙色
    }
    return iconMap[type] || iconMap.station
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
  // 地址转坐标
  async addressToLngLat(address, city = '成都') {
    if (!this.AMap) {
      await this.loadAMapAPI()
    }
    return new Promise((resolve, reject) => {
      this.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new this.AMap.Geocoder({
          city: city
        })
        geocoder.getLocation(address, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            const geocode = result.geocodes[0]
            resolve({
              lng: geocode.location.lng,
              lat: geocode.location.lat,
              address: geocode.formattedAddress
            })
          } else {
            reject(new Error(`地址解析失败: ${result.info}`))
          }
        })
      })
    })
  }
  //获取当前定位
  async getLocationAddress() {
    if (!this.AMap) {
      await this.loadAMapAPI()
    }

    return new Promise((resolve, reject) => {
      // 先检查浏览器是否支持定位
      if (!navigator.geolocation) {
        reject(new Error('您的浏览器不支持地理定位'))
        return
      }

      // 使用高德地图的地理定位插件
      this.AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new this.AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位
          timeout: 10000, // 超时时间，单位毫秒
          GeoLocationFirst: true, // 是否在用户同意后获取
          zoomToAccuracy: true, // 定位成功后是否自动调整地图视野到定位点
          useNative: true, // 是否使用原生定位
          showButton: false, // 不显示定位按钮
          ...this.options.geolocationOptions
        })

        // 绑定定位成功事件
        geolocation.on('complete', (data) => {
          console.log('定位成功:', data)
          resolve({
            success: true,
            position: [data.position.lng, data.position.lat],
            address: data.formattedAddress || '未知地址',
            accuracy: data.accuracy, // 精度
            info: data.info || '定位成功',
            data: data
          })
        })

        // 绑定定位失败事件
        geolocation.on('error', (error) => {
          console.error('定位失败:', error)

          // 尝试使用浏览器原生定位作为备选方案
          if (error.info === 'PERMISSION_DENIED') {
            // this.fallbackToBrowserGeolocation().then(resolve).catch(reject)
            reject({
              success: false,
              error: '定位失败',
              info: error.info || '未知错误'
              // message: this.getGeolocationErrorMessage(error.info)
            })
          } else {
            reject({
              success: false,
              error: '定位失败',
              info: error.info || '未知错误'
              // message: this.getGeolocationErrorMessage(error.info)
            })
          }
        })

        // 开始获取当前位置
        geolocation.getCurrentPosition()
      })
    })
  }
  // 获取当前位置（简化的定位方法，用于地图初始化）
  async getCurrentPosition() {
    try {
      // 首先尝试高德地图定位
      return await this.getLocationAddress()
    } catch (error) {
      console.warn('高德定位失败，尝试浏览器定位:', error.message)

      // 回退到浏览器原生定位
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('浏览器不支持定位'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const wgsLng = position.coords.longitude
              const wgsLat = position.coords.latitude

              // 转换为高德坐标
              const amapPosition = await this.convertFromWGS84([wgsLng, wgsLat])

              // 尝试获取地址
              let address = '当前位置'
              try {
                const addressData = await this.getAddressByLocation(amapPosition)
                address = addressData.address || '当前位置'
              } catch (e) {
                console.warn('获取地址失败:', e.message)
              }

              resolve({
                success: true,
                position: amapPosition,
                address: address,
                accuracy: position.coords.accuracy,
                info: '通过浏览器定位获取',
                isConverted: true
              })
            } catch (conversionError) {
              console.error('坐标转换失败:', conversionError)
              reject(conversionError)
            }
          },
          (error) => {
            const errorMessages = {
              1: '用户拒绝定位请求',
              2: '位置信息不可用',
              3: '定位超时'
            }
            reject(new Error(errorMessages[error.code] || '定位失败'))
          },
          {
            enableHighAccuracy: true,
            timeout: 5000, // 缩短超时时间，避免地图初始化过慢
            maximumAge: 30000
          }
        )
      })
    }
  }
  //输入提示与 POI 搜索示例
  async getSearchAddressList(inputId, options = {}) {
    if (!this.AMap) {
      await this.loadAMapAPI()
    }
    return new Promise((resolve, reject) => {
      try {
        //输入提示
        const autoOptions = {
          input: inputId,
          city: options.city || '成都' // 根据图片，默认城市为成都
        }
        this.AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete'], () => {
          const auto = new this.AMap.AutoComplete(autoOptions)
          const placeSearch = new this.AMap.PlaceSearch({
            map: this.map,
            pageSize: options.pageSize || 1,
            pageIndex: options.pageIndex || 1
          }) //构造地点查询类
          auto.on('select', (e) => {
            placeSearch.setCity(e.poi.adcode)
            placeSearch.search(e.poi.name) //关键字查询查询
            console.log(e)
            resolve(e)
          })
        })
      } catch (err) {
        console.log(err, '搜索发生错误')
        reject(err)
      }
    })
  }
  // 处理输入提示选择
  handleAutoCompleteSelect(e, placeSearch, options) {
    if (!e.poi) return

    const poi = e.poi

    // 清空之前的搜索结果
    this.clearSearchResults()

    // 在地图上标记
    this.addSearchMarker(poi, { isSelected: true })

    // 移动到位置
    if (this.map && poi.location) {
      this.map.setCenter([poi.location.lng, poi.location.lat])
      this.map.setZoom(16)
    }

    // 回调
    if (options.onSelect) {
      options.onSelect(poi)
    }

    // 添加到最近搜索
    this.addToRecentSearches(poi)

    return poi
  }
  // 销毁地图
  destroy() {
    if (this.map) {
      this.map.destroy()
      this.map = null
    }
    this.AMap = null
    this.loaded = false
    this.loadingPromise = null
  }
}
export default SimpleAMapService
