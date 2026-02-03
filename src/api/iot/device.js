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

// 设备拓展字段查询
export function apiDevExpandInfo({ id }) {
  return request.get(`/stage-api/model/device/getExtendInfo/${id}`)
}

// 更新设备拓展字段
export function apiDevUpdateExpandInfo(params) {
  return request.post(`/stage-api/model/device/update/expandInfo`, params)
}

//批量注册 下载模板
export function apiDevdownloadExcelTemplate(params) {
  return request.post(`/stage-api/model/device/download/excel/template`, params, {
    responseType: 'blob'
    // 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  })
}
export function apiDevBatchRegister(params) {
  return request.post(`/stage-api/model/device/batch/register`, params)
}
//获取设备详情
export function apiDevDetail(deviceId) {
  return request.get(`/stage-api/model/device/${deviceId}`)
}

//编辑
export function apiDevEdit(params) {
  return request.put(`/stage-api/model/device/edit`, params)
}

// 获取设备日志
export function apiDevLog(params) {
  return request.post(`/stage-api/model/device/log`, params)
}
//运行状态 属性列表
export function apiOperateStatusList(url, params) {
  return request.post('/stage-api/model/device/' + url, params)
}
//查询历史数据
export function apiHistoryPropertyList(params) {
  return request.post('/stage-api/model/device/data/history/property', params)
}
