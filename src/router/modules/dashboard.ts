import { AppRouteRecord } from '@/types/router'

export const dashboardRoutes: AppRouteRecord = {
  name: 'Dashboard',
  path: '/dashboard',
  component: '/index/index',
  meta: {
    title: 'menus.dashboard.title',

    roles: ['R_SUPER', 'R_ADMIN', 'admin']
  },
  children: [
    {
      path: 'console',
      name: 'Console',
      component: '/dashboard/console',
      meta: {
        icon: 'ri:home-4-fill',
        title: 'menus.dashboard.console',
        keepAlive: false,
        fixedTab: false
      }
    }
  ]
}
