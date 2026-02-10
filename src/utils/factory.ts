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
  value: string | number | boolean
  [key: string]: any
}

type EnumValues<T extends Record<string, EnumItem>> = T[keyof T]['value']
type EnumValueMap<T extends Record<string, EnumItem>> = {
  readonly [K in keyof T]: T[K]['value']
}

// 类型体操：递归替换字符 (模拟 runtime 的 replace)
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Prefix}${From}${infer Suffix}`
  ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}`
  : S

// 类型体操：生成 Key (模拟 runtime 的 enumKeyFromValue)
type GetEnumKey<V extends string | number | boolean> = ReplaceAll<Uppercase<`${V}`>, '-', '_'>
// 运行时辅助函数
function enumKeyFromValue(value: string | number | boolean): string {
  return String(value).toUpperCase().replace(/-/g, '_')
}

// ✅ 1. 对象输入重载
export function createEnum<T extends Record<string, EnumItem>>(
  input: T
): {
  map: T
  options: T[keyof T][]
  values: EnumValueMap<T>
  getLabel: (value: EnumValues<T>) => string
  getItem: (value: EnumValues<T>) => T[keyof T] | undefined
}

// ✅ 2. 数组输入重载 (修复了 values 推断)
export function createEnum<const T extends readonly EnumItem[]>(
  input: T
): {
  map: Record<string, T[number]>
  options: T[number][]
  values: {
    readonly [Item in T[number] as GetEnumKey<Item['value']>]: Item['value']
  }
  // 👈 修改点 3：参数支持 boolean
  getLabel: (value: T[number]['value']) => string
  getItem: (value: T[number]['value']) => T[number] | undefined
}

/**
 * 枚举工厂函数
 * 自动产出 下拉列表数组、值枚举、Label 映射表 以及 安全查询函数。
 */
export function createEnum(input: any) {
  const map: Record<string, EnumItem> = Array.isArray(input)
    ? input.reduce((acc: Record<string, EnumItem>, item: EnumItem) => {
        const key = enumKeyFromValue(item.value)
        acc[key] = item
        return acc
      }, {})
    : input

  const options = Object.values(map)

  // 👈 修改点 4：构建查找表时，Key 统一转为 String (处理 boolean 无法作为索引的问题)
  const kvMap = options.reduce(
    (acc, item) => {
      acc[String(item.value)] = item
      return acc
    },
    {} as Record<string, EnumItem>
  )

  // 👈 修改点 5：查询时，先 String(value) 再查
  const getLabel = (value: string | number | boolean) => {
    if (value === undefined) return ''
    if (value === null) return ''
    return kvMap[String(value)]?.label ?? String(value)
  }

  const getItem = (value: string | number | boolean) => kvMap[String(value)]

  const values = Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.value]))

  return {
    map,
    options,
    values,
    getLabel,
    getItem
  }
}
