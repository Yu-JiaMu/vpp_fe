import { AppRouteRecord } from '@/types/router'

export const energyIot: AppRouteRecord = {
  name: 'EnergyIot',
  path: '/energyIot',
  component: '/index/index',
  meta: {
    title: '能源物联网'
  },
  children: [
    {
      path: 'deviceAccess',
      name: 'DeviceAccess',
      component: '',
      meta: {
        title: '设备接入',
        icon: 'ri:settings-3-fill'
      },
      children: [
        {
          path: 'productCategoryList',
          name: 'ProductCategoryList',
          component: '/deviceAccess/productCategory/productCategoryList',
          meta: {
            title: '产品品类',
            keepAlive: true
          }
        },
        {
          path: 'productCategoryDetail',
          name: 'ProductCategoryDetail',
          component: '/deviceAccess/productCategory/productCategoryDetail',
          meta: {
            title: '产品品类详情',
            isHide: true,
            activePath: '/energyIot/deviceAccess/productCategoryList'
          }
        }
      ]
    }
  ]
}
