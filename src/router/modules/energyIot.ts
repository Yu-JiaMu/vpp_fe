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
      path: 'dashboard',
      name: 'dashboard',
      component: '/dashboard',
      meta: {
        icon: 'ri:home-4-fill',
        title: '首页',
        keepAlive: false,
        fixedTab: false
      }
    },
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
        },
        {
          path: 'product',
          name: 'product',
          component: '/deviceAccess/product/index',
          meta: {
            title: '产品',
            keepAlive: true
          }
        },
        {
          path: 'add-product',
          name: 'addProduct',
          component: '/deviceAccess/product/add-product',
          meta: {
            title: '新增产品',
            keepAlive: false,
            isHide: true,
            activePath: '/energyIot/deviceAccess/product'
          }
        },
        {
          path: 'product-detail',
          name: 'productDetail',
          component: '/deviceAccess/product/product-detail',
          meta: {
            title: '产品详情',
            keepAlive: false,
            isHide: true,
            activePath: '/energyIot/deviceAccess/product'
          }
        },
        // 设备列表
        {
          path: 'device',
          name: 'Device',
          component: '/deviceAccess/device/index',
          meta: {
            title: '设备',
            keepAlive: true
          }
        },
        {
          path: 'device-register',
          name: 'DeviceRegister',
          component: '/deviceAccess/device/device-register/index',
          meta: {
            title: '设备注册',
            isHide: true,
            activePath: '/energyIot/deviceAccess/device'
          }
        },
        {
          path: 'device-detail',
          name: 'DeviceDetail',
          component: '/deviceAccess/device/device-detail/index',
          meta: {
            title: '设备详情',
            isHide: true,
            activePath: '/energyIot/deviceAccess/device'
          }
        },
        // 物模型库
        {
          path: 'thing-model-library',
          name: 'thingModelLibrary',
          component: '/deviceAccess/thing-model-library/index',
          meta: {
            title: '物模型库',
            keepAlive: true
          }
        }
      ]
    },
    {
      path: 'openAPIMagt',
      name: 'OpenAPIMagt',
      component: '',
      meta: {
        title: 'OpenAPI管理',
        icon: 'ri:earth-line'
      },
      children: [
        {
          path: 'appManagementList',
          name: 'AppManagementList',
          component: '/openAPIMagt/appManagement/appManagementList',
          meta: {
            title: '应用管理',
            keepAlive: true
          }
        },
        {
          path: 'app-detail',
          name: 'appDetail',
          component: '/openAPIMagt/appManagement/app-detail',
          meta: {
            title: '应用详情',
            keepAlive: false,
            isHide: true,
            activePath: '/energyIot/openAPIMagt/appManagement'
          }
        },
        {
          path: 'interfaceDebugList',
          name: 'InterfaceDebugList',
          component: '/openAPIMagt/interfaceList/interfaceDebugList',
          meta: {
            title: '接口列表',
            keepAlive: true
          }
        }
      ]
    }
  ]
}
