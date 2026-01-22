import request from '@/utils/http'

const SERVICE_API = '/stage-api/model'

/**
 * 获取产品列表
 * @param {Object} params - 查询参数
 * @param {string} params.name - 产品名称
 * @param {string} params.identifier - 产品唯一标识符
 * @param {number} params.categoryId - 产品品类ID
 * @param {string} params.nodeType - 节点类型
 * @param {string} params.applyLayerProtocol - 应用层协议类型
 * @param {boolean} params.enabled - 是否启用
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.orderByColumn - 排序字段（如：updateTime）
 * @param {string} params.isAsc - 排序方式（asc/desc）
 * @returns {Promise}
 */
export function apiGetProductList(params) {
  return request.get(SERVICE_API + '/product/list', params)
}

// 导出产品
export function apiProductExport(params) {
  return request.post(SERVICE_API + '/product/export', params, { responseType: 'blob' })
}

/**
 * 获取产品详情
 * @param {string} id - 产品ID
 * @returns {Promise}
 */
export function apiGetProductDetail(id) {
  return request.get(SERVICE_API + `/product/${id}`)
}

/**
 * 添加产品
 * @param {Object} params - 产品信息
 * @returns {Promise}
 */
export function apiAddProduct(params) {
  return request.post(SERVICE_API + '/product/add', params)
}

/**
 * 编辑产品
 * @param {Object} params - 产品信息
 * @returns {Promise}
 */
export function apiEditProduct(params) {
  return request.put(SERVICE_API + '/product/edit', params)
}

/**
 * 删除产品
 * @param {Object} params - 删除参数
 * @returns {Promise}
 */
export function apiDeleteProduct(params) {
  return request.post(SERVICE_API + '/product/delete', params)
}

// 获取内置功能点
export function getSystemFunctionPoint() {
  return request.get(SERVICE_API + '/productCateory/builtInFunctionPoint/list')
}

// 更新产品物模型
export function updateProductThingModel(params) {
  return request.post(SERVICE_API + '/product/update/thingModel', params)
}

// 更新产品扩展字段
export function updateProductExpandInfo(params) {
  return request.post(SERVICE_API + '/product/update/expandInfo', params)
}

// 导入产品物模型
export function importProductThingModel(params) {
  return request.get(SERVICE_API + '/product/copy/thingModel', params)
}

// 上传物模型文件导入
export function importProductThingModelJson(params) {
  return request.post(SERVICE_API + `/product/import/thingModel?id=${params.id}`, params.file)
}

// 导出产品物模型
export function exportProductThingModel(id) {
  return request.get(SERVICE_API + `/product/export/thingModel/${id}`, {}, { responseType: 'blob' })
}

// 下载物模型模版
export function downloadThingModelTemplate() {
  return request.get(
    SERVICE_API + `/productCateory/download/thingModelTemplate`,
    {},
    { responseType: 'blob' }
  )
}
