import request from '@/utils/http'
//获取行业数据
export function apiGetIndustryList(params) {
  return request.get('/stage-api/model/productCateory/industry/scene/list', params)
}

/**
 * 产品品类列表
 * @param {*} params
 * @returns
 */
export function apiGetProductCategoryList(params) {
  return request.get('/stage-api/model/productCateory/list', params)
}

export function apiGetSceneList(params) {
  return request.get('/stage-api/model/productCateory/industry/scene/list', params)
}
// 产品品类新增
export function apiProductCategoryAdd(params) {
  return request.post('/stage-api/model/productCateory/add', params)
}
// 产品品类编辑
export function apiProductCategoryEdit(params) {
  return request.put('/stage-api/model/productCateory/edit', params)
}
// 产品品类删除
export function apiProductCategoryDelete(ids) {
  return request.delete(`/stage-api/model/productCateory/${ids}`)
}
