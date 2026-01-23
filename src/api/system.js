import request from '@/utils/http'

// 获取字典数据
export function apiGetDictData(params) {
  return request.get(`/stage-api/system/dict/data/type/${params}`)
}
