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
        dataType: buildDataType(field.dataType),
        desc: field.desc
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

export function buildThingModel(form, type) {
  const base = {
    identifier: form.identifier,
    name: form.name,
    desc: form.desc
  }

  switch (type) {
    case 'property':
      return {
        ...base,
        dataType: buildDataType(form.dataType),
        functionType: 'custom',
        accessMode: form.accessMode,
        functionMode: 'property'
      }
    case 'service':
      return {
        ...base,
        functionType: 'custom',
        callType: form.callType,
        functionMode: 'service',
        input: form.input.map((i) => ({
          identifier: i.identifier,
          name: i.name,
          dataType: buildDataType(i.dataType),
          required: i.required
        })),
        output: form.output.map((o) => ({
          identifier: o.identifier,
          name: o.name,
          dataType: buildDataType(o.dataType),
          required: o.required
        }))
      }
    case 'event':
      return {
        ...base,
        functionType: 'custom',
        eventType: form.eventType,
        functionMode: 'event',
        outputData: form.output.map((o) => ({
          identifier: o.identifier,
          name: o.name,
          dataType: buildDataType(o.dataType),
          required: o.required
        }))
      }
    default:
      break
  }

  return {
    ...base,
    functionType: 'custom',
    accessMode: form.accessMode,
    functionMode: 'property'
  }
}
