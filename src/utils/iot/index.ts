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
  functionMode: string | number
  functionType: string | number
  name: string
  identifier: string
  dataType: DataType
  accessMode: string | number
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

// 把json物模型转成list
export const transformThingJsonToTable = (thingJson: ThingJson): Record<string, any>[] => {
  if (!thingJson) return []
  const result: Record<string, any>[] = []

  function handleDataType(item: ThingItem): string {
    const t = item.dataType?.type
    if (t) {
      const label = DATA_TYPE_MAP.getLabel?.(t) ?? ''
      return `${t}(${label})`
    }
    return '-'
  }

  function buildRow(item: ThingItem, overrides: Record<string, any> = {}): Record<string, any> {
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
