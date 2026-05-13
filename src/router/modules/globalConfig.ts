import { AppRouteRecord } from '@/types/router'

export const globalConfigRoutes: AppRouteRecord = {
  name: 'GlobalConfig',
  path: '/globalConfig',
  component: '/index/index',
  meta: {
    title: '全局配置中心'
  },
  children: [
    {
      path: 'vpp',
      name: 'Vpp',
      component: '',
      meta: {
        title: '虚拟电厂'
      },
      children: [
        {
          path: 'operatorList',
          name: 'VppOperatorList',
          component: '/globalConfig/vpp/operator/operatorList',
          meta: {
            title: '运营商列表',
            keepAlive: true
          }
        },
        {
          path: 'operator-add',
          name: 'VppOperatorAdd',
          component: '/globalConfig/vpp/operator/operatorAdd',
          meta: {
            title: '新增运营商',
            isHide: true,
            keepAlive: false,
            activePath: '/globalConfig/vpp/operatorList'
          }
        },
        {
          path: 'operator-detail',
          name: 'VppOperatorDetail',
          component: '/globalConfig/vpp/operator/operatorDetail',
          meta: {
            title: '运营商详情',
            isHide: true,
            keepAlive: false,
            activePath: '/globalConfig/vpp/operatorList'
          }
        }
      ]
    }
  ]
}
