// UI → thingJson
export function buildDataType(node) {
  if (!node) return null

  // array
  if (node.type === 'array') {
    return {
      type: 'array',
      specs: {
        maxItemsCount: node.config?.maxItemsCount,
        type: node.element.type,
        specs: buildDataType(node.element)?.specs
      }
    }
  }

  // object
  if (node.type === 'object') {
    const specsArray = []

    node.children?.forEach((field) => {
      specsArray.push({
        identifier: field.identifier,
        name: field.name,
        dataType: buildDataType(field.dataType)
      })
    })

    return {
      type: 'object',
      specs: {
        specsArray
      }
    }
  }

  // enum
  if (node.type === 'enum') {
    const specs = {}
    node.config?.list?.forEach((item) => {
      specs[item.value] = item.label
    })
    return { type: 'enum', specs }
  }

  // boolean
  if (node.type === 'boolean') {
    return {
      type: 'boolean',
      specs: {
        true: node.config?.true,
        false: node.config?.false
      }
    }
  }

  // primitive
  return {
    type: node.type,
    specs: { ...node.config }
  }
}

export function buildThingModel(form, isAddStruct = false) {
  const base = {
    identifier: form.identifier,
    name: form.name,
    desc: form.desc,
    dataType: buildDataType(form.dataType)
  }

  if (isAddStruct) return base

  return {
    ...base,
    functionType: 'custom',
    accessMode: form.accessMode,
    functionMode: 'property'
  }
}
