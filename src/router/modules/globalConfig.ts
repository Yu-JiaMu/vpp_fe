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
          path: 'vppSpaceList',
          name: 'VppSpaceList',
          component: '/globalConfig/vpp/vppSpace/vppSpaceList',
          meta: {
            title: '虚拟电厂空间',
            keepAlive: true
          }
        },
        {
          path: 'vpp-space-add',
          name: 'VppSpaceAdd',
          component: '/globalConfig/vpp/vppSpace/vppSpaceAdd',
          meta: {
            title: '新增虚拟电厂',
            isHide: true,
            keepAlive: false,
            activePath: '/globalConfig/vpp/vppSpaceList'
          }
        },
        {
          path: 'vpp-space-detail',
          name: 'VppSpaceDetail',
          component: '/globalConfig/vpp/vppSpace/vppSpaceDetail',
          meta: {
            title: '虚拟电厂详情',
            isHide: true,
            keepAlive: false,
            activePath: '/globalConfig/vpp/vppSpaceList'
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
