import { AppRouteRecord } from '@/types/router'

export const energyIot: AppRouteRecord = {
  name: 'EnergyIot',
  path: '/energyIot',
  component: '/index/index',
  meta: {
    title: '能源物联网',
    icon: 'ri:pie-chart-line'
  },
  children: [
    {
      path: 'deviceAccess',
      name: 'DeviceAccess',
      component: '',
      meta: {
        title: '设备接入'
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
        }
      ]
    }
  ]
}
