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

  // 添加标记
  async addMarker(lnglat, title = '', options = {}) {
    if (!this.map) return null
    const marker = new this.AMap.Marker({
      position: lnglat, //Array.isArray(lnglat) ? new this.AMap.LngLat(lnglat[0], lnglat[1]) : lnglat,
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
  //输入提示
  async getSearchAddressList(inputId, options = {}) {
    // if (!this.AMap) {
    //   await this.loadAMapAPI()
    // }
    return new Promise((resolve, reject) => {
      try {
        //输入提示
        const autoOptions = {
          input: inputId,
          city: options.city || '成都' // 根据图片，默认城市为成都
        }
        this.AMap.plugin(['AMap.AutoComplete'], () => {
          const auto = new this.AMap.AutoComplete(autoOptions)
          auto.on('select', async (e) => {
            console.log(e)
            this.clearMarkers()
            this.addMarker(e.poi.location)
            this.setCenter(e.poi.location)
            const lnglat = [e.poi.location.lng, e.poi.location.lat]
            const address = await this.getCoordinatesToAddress(lnglat)
            if (lnglat.length > 0) {
              const addresObj = {
                address: address,
                lng: lnglat[0],
                lat: lnglat[1]
              }
              resolve(addresObj)
            }
          })
        })
      } catch (err) {
        console.log(err, '搜索发生错误')
        reject(err)
      }
    })
  }
  //逆地理编码（坐标 -> 地址）
  async getCoordinatesToAddress(lnglat) {
    if (!this.AMap) {
      await this.loadAMapAPI()
    }

    return new Promise((resolve, reject) => {
      // 加载 Geocoder 插件
      this.AMap.plugin('AMap.Geocoder', () => {
        try {
          // 创建 Geocoder 实例
          const geocoder = new this.AMap.Geocoder({
            city: '全国'
          })

          // 调用逆地理编码
          geocoder.getAddress(lnglat, (status, result) => {
            if (status === 'complete' && result.regeocode) {
              const address = result.regeocode.formattedAddress
              resolve(address)
            } else {
              console.error('逆地理编码失败:', result)
              reject('根据经纬度查询地址失败')
            }
          })
        } catch (error) {
          console.error('逆地理编码错误:', error)
          reject('地理编码器初始化失败: ' + error.message)
        }
      })
    })
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
