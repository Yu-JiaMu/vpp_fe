import request from '@/utils/http'
/**
 * 列表
 * @param {*} params
 * @returns
 */
export function apiGetDeviceList(params) {
  return request.get('/stage-api/model/device/list', params)
}
/**
 * 批量启用/禁用
 */
export function apiDevUpdateStatus(status, params) {
  return request.post(`/stage-api/model/device/update/status/${status}`, params)
}
//导出设备
export function apiDevExport(params) {
  return request.post(`/stage-api/model/device/export`, params, {
    responseType: 'blob'
  })
}
//批量删除
export function apiDevDelete(params) {
  return request.post(`/stage-api/model/device/delete`, params)
}
//设备统计
export function apiDevStatistics() {
  return request.get(`/stage-api/model/device/statistics`)
}
//单个设备注册
export function apiDevAdd(params) {
  return request.post(`/stage-api/model/device/add`, params)
}
