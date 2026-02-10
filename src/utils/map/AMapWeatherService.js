import CacheService from './CacheService'
import { WEATHER_ICON_MAP } from '@/enums'

const WEATHER_EXPIRE = 3 * 60 * 60 * 1000 // 3 小时
const CACHE_PREFIX = 'AMAP_WEATHER'

const DEFAULT_CITY = '成都市'
const LOCATION_CITY_CACHE_KEY = 'WEATHER_LOCATION_CITY'
const LOCATION_CITY_EXPIRE = 24 * 60 * 60 * 1000 // 1 天

export function getWeatherIcon(weather) {
  if (!weather) return 'ri-sun-line'

  // ① 精确匹配
  if (WEATHER_ICON_MAP[weather]) {
    return WEATHER_ICON_MAP[weather]
  }

  // ② 模糊匹配（防未来字段变化）
  if (weather.includes('雨')) return 'ri-rainy-line'
  if (weather.includes('雪')) return 'ri-snowflake-line'
  if (weather.includes('雷')) return 'ri-thunderstorms-line'
  if (weather.includes('雾') || weather.includes('霾')) return 'ri-foggy-line'
  if (weather.includes('风')) return 'ri-windy-line'
  if (weather.includes('云')) return 'ri-cloudy-line'
  if (weather.includes('晴')) return 'ri-sun-line'

  return 'ri-sun-line'
}

export default class AMapWeatherService {
  constructor(AMap, mapService) {
    this.AMap = AMap
    this.mapService = mapService
    this.cache = new CacheService({
      prefix: CACHE_PREFIX,
      max: 30,
      expire: WEATHER_EXPIRE
    })
  }

  _getCacheKey(city) {
    if (city) return `${city}`
    return `LOCAL`
  }

  /** 真正请求高德天气 */
  fetchLiveWeather(city) {
    return new Promise((resolve, reject) => {
      this.AMap.plugin('AMap.Weather', () => {
        const weather = new this.AMap.Weather()

        weather.getLive(city, (err, data) => {
          if (err) return reject(err)

          resolve(data)
        })
      })
    })
  }

  resolveWeatherCity(addressComponent) {
    if (!addressComponent) return null

    if (addressComponent.adcode) {
      return addressComponent.adcode
    }

    if (addressComponent.city) {
      return Array.isArray(addressComponent.city) ? addressComponent.city[0] : addressComponent.city
    }

    if (addressComponent.province) {
      return addressComponent.province
    }

    return null
  }

  async getLocationCity() {
    // ① 先读缓存
    const cache = this.cache.get(LOCATION_CITY_CACHE_KEY)
    if (cache) return cache

    // ② 再定位
    try {
      const location = await this.mapService.getLocationAndAddress()
      const city = this.resolveWeatherCity(location.addressComponent)

      if (city) {
        this.cache.set(LOCATION_CITY_CACHE_KEY, city, LOCATION_CITY_EXPIRE)
        return city
      }
    } catch (err) {
      console.warn('[weather] 定位失败', err)
    }

    // ③ fallback
    this.cache.set(LOCATION_CITY_CACHE_KEY, DEFAULT_CITY, LOCATION_CITY_EXPIRE)
    return DEFAULT_CITY
  }

  /** 对外统一方法 */
  async getWeather(options = {}) {
    const { city, forceRefresh = false } = options

    // ① 先算 cacheKey（不做任何副作用）
    const cacheKey = this._getCacheKey(city)

    // ② 非强制刷新，优先走缓存（关键：这里不会触发定位）
    if (!forceRefresh) {
      const cache = this.cache.get(cacheKey)
      if (cache) return cache
    }

    let weatherCity = city

    // ③ 只有在「没传 city 且需要请求」时，才去定位
    if (!weatherCity) {
      weatherCity = await this.getLocationCity()
    }

    console.log('[weather] 拉取天气')

    // ④ 拉取天气
    const weather = await this.fetchLiveWeather(weatherCity)

    const result = {
      ...weather,
      icon: getWeatherIcon(weather.weather)
    }

    this.cache.set(cacheKey, result, WEATHER_EXPIRE)
    return result
  }
}
