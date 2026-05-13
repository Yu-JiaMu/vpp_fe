import request from '@/utils/http'

const BASE_URL = '/stage-api/model/vppSpace'

export function getVppSpaceList(params) {
  return request.get(BASE_URL + '/list', params)
}

export function changeVppSpaceStatus(params) {
  return request.post(BASE_URL + '/changeStatus', params)
}

export function addVppSpace(params) {
  return request.post(BASE_URL + '/add', params)
}

export function getVppSpaceDetail(params) {
  return request.get(BASE_URL + '/detail', params)
}

export function editVppSpace(params) {
  return request.put(BASE_URL + '/edit', params)
}
