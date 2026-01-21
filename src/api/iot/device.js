import request from '@/utils/http'
/**
 * 列表
 * @param {*} params
 * @returns
 */
export function apiGetDeviceList(params) {
  return request.get('/stage-api/model/device/list', params)
}
