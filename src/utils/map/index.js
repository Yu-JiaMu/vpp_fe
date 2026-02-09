// utils/simple-amap.js
import AMapLoader from '@amap/amap-jsapi-loader'

const key = 'a9f1840ab6ebfb81e17f611ca72572d2'
const securityJsCode = '522054ec0e1ef9da651e7975e9235abf'

class SimpleAMapService {
  weatherService = null
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

    // 新增属性用于存储最后添加的标记
    this._lastMarker = null
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
      // 设置Canvas上下文属性
      // const originalGetContext = HTMLCanvasElement.prototype.getContext
      // HTMLCanvasElement.prototype.getContext = function (...args) {
      //   const context = originalGetContext.apply(this, args)
      //   if (context && context.constructor.name === 'CanvasRenderingContext2D') {
      //     context.willReadFrequently = true
      //   }
      //   return context
      // }
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
      position: lnglat,
      title: title,
      icon: options.icon || 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
      offset: new this.AMap.Pixel(-13, -30),
      ...options
    })
    this.map.add(marker)

    // 保存最后添加的标记
    this._lastMarker = marker

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
    this._lastMarker = null
  }

  // 定位到指定坐标
  setCenter(lnglat) {
    if (this.map) {
      this.map.setCenter(lnglat)
    }
  }

  // 获取当前定位
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
          enableHighAccuracy: true,
          timeout: 10000,
          GeoLocationFirst: true,
          zoomToAccuracy: true,
          useNative: true,
          showButton: false,
          ...this.options.geolocationOptions
        })

        // 绑定定位成功事件
        geolocation.on('complete', (data) => {
          console.log('定位成功:', data)
          resolve({
            success: true,
            position: [data.position.lng, data.position.lat],
            address: data.formattedAddress || '未知地址',
            accuracy: data.accuracy,
            info: data.info || '定位成功',
            data: data
          })
        })

        // 绑定定位失败事件
        geolocation.on('error', (error) => {
          console.error('定位失败:', error)
          if (error.info === 'PERMISSION_DENIED') {
            reject({
              success: false,
              error: '定位失败',
              info: error.info || '未知错误'
            })
          } else {
            reject({
              success: false,
              error: '定位失败',
              info: error.info || '未知错误'
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
            timeout: 5000,
            maximumAge: 30000
          }
        )
      })
    }
  }

  // 输入提示
  async getSearchAddressList(inputId, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const autoOptions = {
          input: inputId,
          city: options.city || '成都'
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

  // 逆地理编码（坐标 -> 地址）
  async getCoordinatesToAddress(lnglat) {
    if (!this.AMap) {
      await this.loadAMapAPI()
    }

    return new Promise((resolve, reject) => {
      this.AMap.plugin('AMap.Geocoder', () => {
        try {
          const geocoder = new this.AMap.Geocoder({
            city: '全国'
          })

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

  // 点击地图标点 - 修改后的版本，可以重复调用获取地址
  async handleClickMapAddMarker(options = {}) {
    if (!this.map) {
      console.warn('地图未初始化，请先创建地图')
      return
    }

    return new Promise((resolve, reject) => {
      try {
        // 清除之前的事件监听器
        if (this._mapClickHandler) {
          this.map.off('click', this._mapClickHandler)
        }

        // 定义点击事件处理函数
        this._mapClickHandler = async (event) => {
          const lng = event.lnglat.getLng()
          const lat = event.lnglat.getLat()
          const position = [lng, lat]

          console.log('地图点击位置:', { lng, lat })

          // 清除上一次的标记
          this.clearMarkers()

          // 添加新标记
          this.addMarker(position, options.markerTitle || '点击位置')

          // 自动定位到标记位置
          this.setCenter(position)

          // 获取地址
          let address = null
          if (options.getAddress !== false) {
            try {
              address = await this.getCoordinatesToAddress(position)
              console.log('获取到地址:', address)
            } catch (error) {
              console.warn('获取地址失败:', error)
              address = '未知位置'
            }
          }

          // 返回结果
          const result = {
            lng: lng,
            lat: lat,
            lnglat: position,
            address: address,
            success: true
          }

          // 返回结果给调用者
          if (options.once) {
            // 一次性监听，返回结果后停止监听
            this.map.off('click', this._mapClickHandler)
            resolve(result)
          } else {
            // 持续监听，通过回调返回结果
            if (typeof options.onClick === 'function') {
              options.onClick(result)
            }
          }
        }

        // 绑定点击事件
        this.map.on('click', this._mapClickHandler)

        console.log('地图点击监听已启用')

        // 如果是一次性监听，设置超时
        if (options.once && options.timeout) {
          setTimeout(() => {
            this.map.off('click', this._mapClickHandler)
            reject(new Error('选择超时，请在' + options.timeout / 1000 + '秒内点击地图'))
          }, options.timeout)
        } else if (!options.once) {
          // 持续监听，立即返回成功
          resolve({
            success: true,
            listening: true,
            stop: () => {
              this.map.off('click', this._mapClickHandler)
            }
          })
        }
      } catch (error) {
        console.error('启用地图点击监听失败:', error)
        reject(error)
      }
    })
  }

  // 停止地图点击监听
  stopMapClickListening() {
    if (this.map && this._mapClickHandler) {
      this.map.off('click', this._mapClickHandler)
      this._mapClickHandler = null
      console.log('地图点击监听已停止')
    }
  }

  // 坐标 → 行政区信息
  getAddressComponentByLocation(lnglat) {
    return new Promise((resolve, reject) => {
      this.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder({
          city: '全国'
        })

        geocoder.getAddress(lnglat, (status, result) => {
          if (status === 'complete' && result.regeocode) {
            resolve(result.regeocode.addressComponent)
          } else {
            reject('逆地理失败')
          }
        })
      })
    })
  }

  /**
   * 获取当前位置信息和对应的行政区信息
   */
  async getLocationAndAddress() {
    const location = await this.getLocationAddress()

    const lnglat = location.position

    const addressComponent = await this.getAddressComponentByLocation(lnglat)

    return { lnglat, addressComponent }
  }

  // 销毁地图
  destroy() {
    // 停止所有监听
    this.stopMapClickListening()

    // 销毁地图实例
    if (this.map) {
      this.map.destroy()
      this.map = null
    }

    // 清理其他属性
    this.AMap = null
    this.loaded = false
    this.loadingPromise = null
    this._lastMarker = null

    console.log('地图已销毁')
  }
}

export default SimpleAMapService
