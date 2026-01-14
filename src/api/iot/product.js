import request from '@/utils/http'

const SERVICE_API = '/stage-api/model'

// 获取内置功能点
export function getSystemFunctionPoint() {
  return request.get(SERVICE_API + '/productCateory/builtInFunctionPoint/list')
}
