import request from '@/utils/http'

const BASE_URL = '/stage-api/model/vppOperator'

export function getOperatorList(params) {
  return request.get(BASE_URL + '/list', params)
}

export function changeOperatorStatus(params) {
  return request.post(BASE_URL + '/changeStatus', params)
}

export function getOperatorDetail(params) {
  return request.get(BASE_URL + '/detail', params)
}

export function addOperator(params) {
  return request.post(BASE_URL + '/add', params)
}

export function editOperator(params) {
  return request.put(BASE_URL + '/edit', params)
}

export function deleteOperator(params) {
  return request.delete(BASE_URL + '/delete', params)
}
