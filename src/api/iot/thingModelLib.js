import request from '@/utils/http'

const SERVICE_API = '/stage-api/model'

// 查询物模型库列表
export function apiThingModelList(params) {
  return request.get(SERVICE_API + '/thingModelLibrary/list', params)
}

// 新增物模型库
export function apiThingModelAdd(params) {
  return request.post(SERVICE_API + '/thingModelLibrary/add', params)
}

// 编辑物模型
export function apiThingModelEdit(params) {
  return request.put(SERVICE_API + '/thingModelLibrary/edit', params)
}

// 删除物模型
export function apiThingModelDelete(params) {
  return request.post(SERVICE_API + '/thingModelLibrary/delete', params)
}

// 批量导出物模型
export function apiThingModelExport(params) {
  return request.post(SERVICE_API + '/thingModelLibrary/export', params, { responseType: 'blob' })
}

// 物模型库导入模版获取
export function apiThingModelImportTemplate(params) {
  return request.post(SERVICE_API + '/thingModelLibrary/export/template', params, {
    responseType: 'blob'
  })
}

// 物模型库导入
export function importLibThingModelJson(params) {
  return request.post(SERVICE_API + '/thingModelLibrary/import', params.file)
}

// 判断标识符是否存在
export function apiThingModelIdentifierCheck(params) {
  return request.get(SERVICE_API + '/thingModelLibrary/exist/identifier', params)
}
