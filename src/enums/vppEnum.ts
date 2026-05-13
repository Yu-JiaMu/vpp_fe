import { createEnum } from '@/utils'

/** 运营商状态 */
export const OPERATOR_STATUS = createEnum({
  NORMAL: { label: '正常', value: 1, tag: 'success' },
  EXPIRED: { label: '已过期', value: 2, tag: 'danger' },
  DISABLED: { label: '已禁用', value: 3, tag: 'info' }
})

/** 虚拟电厂状态 */
export const VPP_STATUS = createEnum({
  NORMAL: { label: '正常', value: 1, tag: 'success' },
  EXPIRED: { label: '已过期', value: 2, tag: 'danger' },
  DISABLED: { label: '已禁用', value: 3, tag: 'info' }
})

/** 虚拟电厂类型 */
export const VPP_TYPE = createEnum({
  GENERATION: { label: '发电类虚拟电厂', value: 1, tag: 'success' },
  LOAD: { label: '负荷类虚拟电厂', value: 2, tag: 'primary' }
})

/** 市场准入状态 */
export const MARKET_ACCESS_STATUS = createEnum({
  NOT_ACCESSED: { label: '未准入', value: 1, tag: 'info' },
  REGISTERED: { label: '已注册', value: 2, tag: 'success' },
  SUSPENDED: { label: '暂停', value: 3, tag: 'warning' },
  CANCELLED: { label: '注销', value: 4, tag: 'danger' }
})
