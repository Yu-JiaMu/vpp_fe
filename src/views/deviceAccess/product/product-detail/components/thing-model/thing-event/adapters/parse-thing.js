export function parseDataType(data, form) {
  form.name = data.name
  form.identifier = data.identifier
  form.callType = data.callType
  form.desc = data.desc || ''

  form.input = data.input.map((item) => ({
    name: item.name,
    identifier: item.identifier,
    required: item.required,
    dataType: {
      type: item.dataType.type,
      specs: item.dataType.specs || {}
    }
  }))

  form.output = data.output.map((item) => ({
    name: item.name,
    identifier: item.identifier,
    required: item.required,
    dataType: {
      type: item.dataType.type,
      specs: item.dataType.specs || {}
    }
  }))
}
