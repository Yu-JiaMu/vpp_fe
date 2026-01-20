import {
  FUNCTION_MODE_MAP,
  THING_SOURCE_MAP,
  ACCESS_MODE_MAP,
  CALL_TYPE_MAP,
  EVENT_TYPE_MAP,
  DATA_TYPE_MAP
} from '@/enums'

type DataType = { type?: string; [k: string]: any }

type ThingItem = {
  functionMode: string
  functionType: string
  name: string
  identifier: string
  dataType: DataType
  accessMode: string
  [k: string]: any
}

type Module = {
  properties?: ThingItem[]
  events?: ThingItem[]
  functions?: ThingItem[]
  [k: string]: any
}

type ThingJson = {
  modules?: Module[]
  [k: string]: any
}
export function handleDataType(item: ThingItem): string {
  let t = item.dataType?.type
  if (t) {
    t = t.toLowerCase()
    const label = DATA_TYPE_MAP.getLabel?.(t) ?? ''
    return `${t}(${label})`
  }
  return '-'
}
export function buildRow(
  item: ThingItem,
  overrides: Record<string, any> = {}
): Record<string, any> {
  return {
    originData: item,
    type: FUNCTION_MODE_MAP.getLabel?.(item.functionMode) ?? '-', // 功能类型
    source: THING_SOURCE_MAP.getLabel?.(item.functionType) ?? '-', // 功能来源
    name: item.name ?? '-', // 功能名称
    identifier: item.identifier ?? '-', // 标识符
    id: item.identifier ?? '-', // 标识符别名
    dataType: handleDataType(item), // 数据类型
    define: item.dataType || {}, // 数据定义
    accessMode: ACCESS_MODE_MAP.getLabel?.(item.accessMode) ?? '-', // 读写权限
    functionMode: item.functionMode,
    ...overrides
  }
}

// 把json物模型转成list
export const transformThingJsonToTable = (thingJson: ThingJson): Record<string, any>[] => {
  if (!thingJson) return []
  const result: Record<string, any>[] = []

  const MODULE_HANDLERS: { key: keyof Module; map: (item: ThingItem) => Record<string, any> }[] = [
    {
      key: 'properties',
      map: (item) => buildRow(item)
    },

    {
      key: 'functions',
      map: (item) =>
        buildRow(item, {
          dataType: '-',
          accessMode: '-'
        })
    },
    {
      key: 'events',
      map: (item) =>
        buildRow(item, {
          dataType: '-',
          accessMode: '-'
        })
    }
  ]

  thingJson.modules?.forEach((module) => {
    MODULE_HANDLERS.forEach(({ key, map }) => {
      const list = module[key]
      list?.forEach((item: ThingItem) => {
        result.push(map(item))
      })
    })
  })

  return result
}

/**
 * table 列表 → 物模型 ThingJson
 */
export function transformTableToThingJson(
  tableList: Record<string, any>[],
  thingJson: ThingJson
): ThingJson {
  if (!Array.isArray(tableList)) {
    return { modules: [] }
  }

  // 这里默认只有一个 module（与当前 transform 逻辑一致）
  const module: Module = {
    properties: [],
    functions: [],
    events: []
  }

  tableList.forEach((row) => {
    const origin: ThingItem | undefined = row.originData
    if (!origin) return

    switch (origin.functionMode) {
      case FUNCTION_MODE_MAP.values.PROPERTY:
        module.properties!.push(cloneThingItem(origin))
        break

      case FUNCTION_MODE_MAP.values.SERVICE:
        module.functions!.push(cloneThingItem(origin))
        break

      case FUNCTION_MODE_MAP.values.EVENT:
        module.events!.push(cloneThingItem(origin))
        break

      default:
        break
    }
  })

  return {
    ...thingJson,
    modules: [cleanEmptyModule(module)]
  }
}

/**
 * 深拷贝 ThingItem，避免污染 table 中的 originData
 */
function cloneThingItem(item: ThingItem): ThingItem {
  return JSON.parse(JSON.stringify(item))
}

/**
 * 清理空数组字段（更符合后端期望）
 */
function cleanEmptyModule(module: Module): Module {
  const result: Module = {}

  if (module.properties?.length) result.properties = module.properties
  if (module.functions?.length) result.functions = module.functions
  if (module.events?.length) result.events = module.events

  return result
}
