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

/**
 * 节点类型定义：包含不同节点的标签和值。
 */
export const NODE_TYPES = createEnum({
  DIRECT: { label: '直连设备', value: 'direct-connect-device' },
  GATEWAY: { label: '网关设备', value: 'gateway-device' },
  SUB_DEVICE: { label: '网关子设备', value: 'gateway-sub-device' }
})

/**
 * 常用联网方式选项
 */
export const CONNECTION_TYPES = createEnum({
  WIFI: { label: 'Wi-Fi', value: 'Wi-Fi' },
  CELLULAR: { label: '蜂窝 (2G/3G/4G/5G)', value: 'mobile_network' },
  ETHERNET: { label: '以太网', value: 'Ethernet' },
  LORAWAN: { label: 'LoRaWAN', value: 'LoRaWAN' },
  OTHER: { label: '其他', value: 'other' }
})

// 协议类型
export const PROTOCOL_TYPES_MAP = createEnum({
  MQTT: { label: 'MQTT', value: 'MQTT' }
  // HTTP: { label: 'HTTP', value: 'http' }
})

// 数据格式
export const DATA_FORMAT_MAP = createEnum({
  JSON: { label: 'JSON', value: 'JSON' }
  // XML: { label: 'XML', value: 'xml' }
})

// 认证方式
export const AUTH_MODE_MAP = createEnum({
  SECRET: { label: '设备密钥', value: 'device_key' },
  SN: { label: '设备序列号', value: 'device_serial_number' }
})

// 功能类型
export const FUNCTION_MODE_MAP = createEnum({
  PROPERTY: { label: '属性', value: 'property', pKey: 'properties' },
  SERVICE: { label: '功能', value: 'function', pKey: 'functions' },
  EVENT: { label: '事件', value: 'event', pKey: 'events' }
})

// 物模型来源
export const THING_SOURCE_MAP = createEnum({
  SYSTEM: { label: '系统', value: 'st' },
  CUSTOM: { label: '自定义', value: 'custom' }
})

// 读写类型
export const ACCESS_MODE_MAP = createEnum({
  READ: { label: '只读', value: 'r' },
  READ_WRITE: { label: '读写', value: 'rw' }
})

// 同异步方式
export const CALL_TYPE_MAP = createEnum({
  SYNC: { label: '同步', value: 'sync' },
  ASYNC: { label: '异步', value: 'async' }
})

// 事件类型
export const EVENT_TYPE_MAP = createEnum({
  INFO: { label: '普通', value: 'info' },
  WARN: { label: '警告', value: 'warn' },
  ERROR: { label: '紧急', value: 'error' }
})

// 数据类型
export const DATA_TYPE_MAP = createEnum({
  INT: { label: '整数', value: 'int' },
  FLOAT: { label: '浮点数', value: 'float' },
  DOUBLE: { label: '双精度浮点数', value: 'double' },
  TEXT: { label: '文本', value: 'text' },
  DATE: { label: '时间戳', value: 'date' },
  BOOLEAN: { label: '布尔', value: 'boolean' },
  ENUM: { label: '枚举', value: 'enum' },
  ARRAY: { label: '数组', value: 'array' },
  OBJECT: { label: '结构体', value: 'object' },
  PASSWORD: { label: '密码', value: 'password' },
  GEO_POINT: { label: '坐标', value: 'geo_point' }
})

// 是否必填
export const REQUIRED_MAP = createEnum({
  TRUE: { label: '必填', value: true },
  FALSE: { label: '非必填', value: false }
})

//设备状态
export const DEVICE_STATUS_TYPES = createEnum({
  UNACTIVATED: { label: '未激活', value: 'unactivation', tag: 'primary' },
  OFFLINE: { label: '离线', value: 'offLine', tag: 'info' },
  ONLINE: { label: '在线', value: 'onLine', tag: 'success' }
})

//产品类别
export const INTERNAL_DEVICE_TYPES = createEnum({
  INNER: { label: '内置', value: 'inner' },
  DEFINE: { label: '自定义', value: 'define' }
})

// 日志类型
export const LOG_TYPES = createEnum({
  PROPERTY_REPORT: { label: '属性上报', value: 'PROPERTY_REPORT' },
  PROPERTY_SET: { label: '属性设置', value: 'PROPERTY_SET' },
  EVENT_REPORT: { label: '事件上报', value: 'EVENT_REPORT' },
  FUNCTION_CALL: { label: '功能调用', value: 'FUNCTION_CALL' },
  FUNCTION_RESPONSE: { label: '功能响应', value: 'FUNCTION_RESPONSE' },
  DEVICE_ONLINE: { label: '设备上线', value: 'DEVICE_ONLINE' },
  DEVICE_OFFLINE: { label: '设备离线', value: 'DEVICE_OFFLINE' },
  OTHER: { label: '其他', value: 'OTHER' }
})
