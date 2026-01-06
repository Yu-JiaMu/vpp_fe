/**
 * 物联网枚举与常量
 *
 * 提供设备节点类型、标签映射，以及常用联网方式选项，供表单、下拉和展示使用。
 *
 *
 * @module enums/iotEnum
 * @author Art Design Pro Team
 */
import { createEnum } from '@/utils'

/**
 * 节点类型定义：包含不同节点的标签和值。
 // --- 使用场景 ---

// A. 下拉框渲染
// <Select options={NODE_TYPE.options} />

// B. 表格回显 (性能最优 O(1))
// <td>{ NODE_TYPE.getLabel(row.type) }</td>

// C. 判断逻辑 (类型安全)
// if (type === NODE_TYPE.values.DIRECT) { ... }

// D. 获取额外属性
// const color = NODE_TYPE.getItem('direct')?.color;
*/
export const NODE_TYPES = createEnum({
  DIRECT: { label: '直连设备', value: 'direct' },
  GATEWAY: { label: '网关设备', value: 'gateway' },
  SUB_DEVICE: { label: '网关子设备', value: 'sub-device' }
})

/**
 * 常用联网方式选项
 */
export const CONNECTION_TYPES = createEnum({
  WIFI: { label: 'Wi-Fi', value: 'wifi' },
  CELLULAR: { label: '蜂窝 (2G/3G/4G/5G)', value: 'cellular' },
  ETHERNET: { label: '以太网', value: 'ethernet' },
  LORAWAN: { label: 'LoRaWAN', value: 'lorawan' },
  OTHER: { label: '其他', value: 'other' }
})
