// form数据结构说明
export interface ThingForm {
  name: string
  identifier: string
  accessMode: 'r' | 'rw'
  desc: string
  dataType: DataTypeNode
}

export interface DataTypeNode {
  type: string
  config?: Record<string, any> // min / max / length / list / unit ...
  element?: DataTypeNode // array 专用
  children?: StructField[] // object 专用
}

export interface StructField {
  name: string
  identifier: string
  dataType: DataTypeNode
  desc: string
}
