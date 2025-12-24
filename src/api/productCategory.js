import request from '@/utils/http'
//获取行业数据
export function apiGetIndustryList(params) {
  // return request.post('/api/auth/login', params, {})
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          { label: '制造业', value: 'manufacturing' },
          { label: '零售业', value: 'retail' },
          { label: '金融业', value: 'finance' },
          { label: '医疗健康', value: 'healthcare' },
          { label: '教育行业', value: 'education' }
        ]
      })
    }, 1000)
  })
}
/**
 * 获取场景类列表
 */
export function apiGetSceneList(params) {
  // return request.post('/api/auth/login', params, {})
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          { label: '制造业', value: 'manufacturing' },
          { label: '零售业', value: 'retail' },
          { label: '金融业', value: 'finance' },
          { label: '医疗健康', value: 'healthcare' },
          { label: '教育行业', value: 'education' }
        ]
      })
    }, 1000)
  })
}
