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

/**
 * @Description 查询列表接口
 * @author Huang Jialin
 * @date 2026/4/15 16:37
 */
export function apiGetApiApplicationList(params) {
  return request.get(SERVICE_API + '/apiApplication/list', params)
}

/**
 * @Description 修改应用信息接口
 * @author Huang Jialin
 * @date 2026/4/15 16:38
 */
export function updateApiApplication(params) {
  return request.post(SERVICE_API + '/apiApplication/edit', params)
}
/**
 * @Description 删除应用信息接口
 * @author Huang Jialin
 * @date 2026/4/15 16:38
 */
export function deleteApiApplication(params) {
  return request.post(SERVICE_API + '/apiApplication/delete', params)
}

/**
 * @Description 新增应用信息接口
 * @author Huang Jialin
 * @date 2026/4/15 16:38
 */
export function addApiApplication(params) {
  return request.post(SERVICE_API + '/apiApplication/add', params)
}

/**
 * @Description 应用信息详情接口
 * @author Huang Jialin
 * @date 2026/4/15 16:38
 */
export function detailApiApplication(params) {
  return request.get(SERVICE_API + '/apiApplication/detail', params)
}

/**
 * @Description 应用请求日志接口
 * @author Huang Jialin
 * @date 2026/4/15 16:38
 */
export function reqLogApiApplication(params) {
  return request.get(SERVICE_API + '/apiApplication/request/log/list', params)
}
