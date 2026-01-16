// thingJson → UI
export function parseDataType(dataType) {
  if (!dataType) return null

  // array
  if (dataType.type === 'array') {
    return {
      type: 'array',
      config: {
        maxItemsCount: dataType.specs.maxItemsCount
      },
      element: {
        type: dataType.specs.type,
        config: { ...dataType.specs.specs }
      }
    }
  }

  // object
  if (dataType.type === 'object') {
    const specsArray = dataType.specs?.specsArray || []

    return {
      type: 'object',
      children: specsArray.map((item) => ({
        identifier: item.identifier,
        name: item.name,
        dataType: parseDataType(item.dataType)
      }))
    }
  }

  // enum
  if (dataType.type === 'enum') {
    return {
      type: 'enum',
      config: {
        list: Object.entries(dataType.specs || {}).map(([value, label]) => ({ value, label }))
      }
    }
  }

  // boolean
  if (dataType.type === 'boolean') {
    return {
      type: 'boolean',
      config: { ...dataType.specs }
    }
  }

  // primitive
  return {
    type: dataType.type,
    config: { ...dataType.specs }
  }
}
