// thingJson → UI
const NUMBER_SPEC_KEYS = ['max', 'min', 'step', 'length', 'maxItemsCount']

// 数据类型转换
function normalizeSpecsToNumber(specs = {}) {
  const result = { ...specs }

  NUMBER_SPEC_KEYS.forEach((key) => {
    if (result[key] !== undefined && result[key] !== null) {
      const num = Number(result[key])
      result[key] = Number.isNaN(num) ? result[key] : num
    }
  })

  return result
}

export function parseDataType(dataType) {
  if (!dataType) return null

  const { type, specs } = dataType

  // array
  if (type === 'array') {
    return {
      type: 'array',
      config: {
        maxItemsCount: specs?.maxItemsCount
      },
      element: {
        type: specs?.type,
        ...parseDataType({
          type: specs?.type,
          specs: specs?.specs
        })
      }
    }
  }

  // object
  if (type === 'object') {
    return {
      type: 'object',
      children:
        specs?.specsArray?.map((item) => ({
          identifier: item.identifier,
          name: item.name,
          desc: item.desc,
          dataType: parseDataType(item.dataType)
        })) || []
    }
  }

  // enum
  if (type === 'enum') {
    return {
      type: 'enum',
      config: {
        list: Object.entries(specs || {}).map(([value, label]) => ({
          value: isNaN(Number(value)) ? value : Number(value),
          label
        }))
      }
    }
  }

  // boolean
  if (type === 'boolean') {
    return {
      type: 'boolean',
      config: {
        true: specs?.true,
        false: specs?.false
      }
    }
  }

  // primitive: int / float / text / date / double ...
  return {
    type,
    config: normalizeSpecsToNumber(specs || {})
  }
}

// thingJson → UI Form
export function parseThingModel(json) {
  if (!json) return null

  const base = {
    identifier: json.identifier,
    name: json.name,
    desc: json.desc
  }

  if (json.id) {
    base.id = json.id
  }

  switch (json.functionMode) {
    case 'property':
      return {
        ...base,
        accessMode: json.accessMode,
        dataType: parseDataType(json.dataType)
      }

    case 'function':
      return {
        ...base,
        callType: json.callType,
        input:
          json.input?.map((i) => ({
            identifier: i.identifier,
            name: i.name,
            required: i.required,
            dataType: parseDataType(i.dataType),
            desc: i.desc
          })) || [],
        output:
          json.output?.map((o) => ({
            identifier: o.identifier,
            name: o.name,
            required: o.required,
            dataType: parseDataType(o.dataType),
            desc: o.desc
          })) || []
      }

    case 'event':
      return {
        ...base,
        eventType: json.eventType,
        output:
          json.outputData?.map((o) => ({
            identifier: o.identifier,
            name: o.name,
            required: o.required,
            dataType: parseDataType(o.dataType),
            desc: o.desc
          })) || []
      }

    default:
      return {
        ...base,
        required: json.required,
        dataType: parseDataType(json.dataType)
      }
  }
}
