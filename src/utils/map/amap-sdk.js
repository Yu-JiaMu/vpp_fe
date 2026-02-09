// amap-sdk.js
import SimpleAMapService from './index'
import AMapWeatherService from './AMapWeatherService'

let weatherService

export async function initAMapWeather() {
  if (weatherService) return weatherService

  const mapService = new SimpleAMapService()
  await mapService.loadAMapAPI()

  weatherService = new AMapWeatherService(window.AMap, mapService)
  return weatherService
}
