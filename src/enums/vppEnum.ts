import { createEnum } from '@/utils'

/** 运营商状态 */
export const OPERATOR_STATUS = createEnum({
  NORMAL: { label: '正常', value: 1, tag: 'success' },
  EXPIRED: { label: '已过期', value: 2, tag: 'danger' },
  DISABLED: { label: '已禁用', value: 3, tag: 'info' }
})
