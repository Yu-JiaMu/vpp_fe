/**
 * 工厂函数
 
 * 使用实例
  export const NODE_TYPE = createEnum({
  DIRECT: { label: "直连设备", value: "direct", color: 'green' },
  GATEWAY: { label: "网关设备", value: "gateway", color: 'blue' },
  SUB_DEVICE: { label: "网关子设备", value: "sub-device", color: 'orange' }
});

// --- 使用场景 ---

// A. 下拉框渲染
 <Select options={NODE_TYPE.options} />

// B. 表格回显 (性能最优 O(1))
 <td>{ NODE_TYPE.getLabel(row.type) }</td>

// C. 判断逻辑 (类型安全)
 if (type === NODE_TYPE.values.DIRECT) { ... }

// D. 获取额外属性
 const color = NODE_TYPE.getItem('direct')?.color;

 * @module utils/factory
 * @author Art Design Pro Team
 */

/**
 * 枚举项基础接口
 */
interface EnumItem {
  label: string
  value: string | number
  [key: string]: any
}

/**
 * 枚举工厂函数
 * 自动产出 下拉列表数组、值枚举、Label 映射表 以及 安全查询函数。
 */
export function createEnum<T extends Record<string, EnumItem>>(config: T) {
  // 使用类型断言明确告诉 TS，这里的所有项都符合 T 的属性类型
  const options = Object.values(config) as T[keyof T][]

  // 这里的 kvMap 存储的是整项数据
  const kvMap = Object.values(config).reduce(
    (acc, item) => {
      acc[item.value] = item as T[keyof T] // 显式断言
      return acc
    },
    {} as Record<string | number, T[keyof T]>
  )

  const getLabel = (value: string | number): string => {
    return kvMap[value]?.label || String(value)
  }

  const getItem = (value: string | number): T[keyof T] | undefined => {
    return kvMap[value]
  }

  // 提取 values 时使用 mapped types 保持字面量类型
  const values = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [key, item.value])
  ) as { [K in keyof T]: T[K]['value'] }

  return {
    map: config,
    options,
    getLabel,
    getItem,
    values
  }
}
