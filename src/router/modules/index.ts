import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { energyIot } from './energyIot'
import { globalConfigRoutes } from './globalConfig'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  // dashboardRoutes,
  energyIot,
  globalConfigRoutes,
  // systemRoutes,
  resultRoutes,
  exceptionRoutes
]
