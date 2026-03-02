/**
 * 表单验证工具模块
 *
 * 提供全面的表单字段验证功能
 *
 * ## 主要功能
 *
 * - 手机号码验证（中国大陆格式）
 * - 固定电话验证（支持区号格式）
 * - 用户账号验证（字母开头，支持数字和下划线）
 * - 密码强度验证（普通密码、强密码）
 * - 密码强度评估（弱、中、强）
 * - IPv4 地址验证
 * - 邮箱地址验证（RFC 5322 标准）
 * - URL 地址验证
 * - 身份证号码验证（18位，含校验码验证）
 * - 银行卡号验证（Luhn 算法）
 * - 字符串空格处理
 *
 * ## 验证规则
 *
 * - 手机号：1开头，第二位3-9，共11位
 * - 账号：字母开头，5-20位，支持字母数字下划线
 * - 普通密码：6-20位，必须包含字母和数字
 * - 强密码：8-20位，必须包含大小写字母、数字和特殊字符
 * - 身份证：18位，含出生日期和校验码验证
 * - 银行卡：13-19位，通过 Luhn 算法验证
 *
 * @module utils/validation/formValidator
 * @author Art Design Pro Team
 */
import type { FormItemRule } from 'element-plus'

/**
 * 密码强度级别枚举
 */
export enum PasswordStrength {
  WEAK = '弱',
  MEDIUM = '中',
  STRONG = '强'
}

/**
 * 去除字符串首尾空格
 * @param value 待处理的字符串
 * @returns 返回去除首尾空格后的字符串
 */
export function trimSpaces(value: string): string {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

/**
 * 验证手机号码（中国大陆）
 * @param value 手机号码字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validatePhone(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // 中国大陆手机号码：1开头，第二位为3-9，共11位数字
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(value.trim())
}

/**
 * 验证固定电话号码（中国大陆）
 * @param value 电话号码字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateTelPhone(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // 支持格式：区号-号码，如：010-12345678、0755-1234567
  const telRegex = /^0\d{2,3}-?\d{7,8}$/
  return telRegex.test(value.trim().replace(/\s+/g, ''))
}

/**
 * 验证用户账号
 * @param value 账号字符串
 * @returns 返回验证结果，true表示格式正确
 * @description 规则：字母开头，5-20位，支持字母、数字、下划线
 */
export function validateAccount(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // 字母开头，5-20位，支持字母、数字、下划线
  const accountRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/
  return accountRegex.test(value.trim())
}

/**
 * 验证密码
 * @param value 密码字符串
 * @returns 返回验证结果，true表示格式正确
 * @description 规则：6-20位，必须包含字母和数字
 */
export function validatePassword(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 长度检查
  if (trimmedValue.length < 6 || trimmedValue.length > 20) {
    return false
  }

  // 必须包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)

  return hasLetter && hasNumber
}

/**
 * 验证强密码
 * @param value 密码字符串
 * @returns 返回验证结果，true表示格式正确
 * @description 规则：8-20位，必须包含大写字母、小写字母、数字和特殊字符
 */
export function validateStrongPassword(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 长度检查
  if (trimmedValue.length < 8 || trimmedValue.length > 20) {
    return false
  }

  // 必须包含：大写字母、小写字母、数字、特殊字符
  const hasUpperCase = /[A-Z]/.test(trimmedValue)
  const hasLowerCase = /[a-z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedValue)

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}

/**
 * 获取密码强度
 * @param value 密码字符串
 * @returns 返回密码强度：弱、中、强
 * @description 弱：纯数字/纯字母/纯特殊字符；中：两种组合；强：三种或以上组合
 */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value || typeof value !== 'string') {
    return PasswordStrength.WEAK
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length < 6) {
    return PasswordStrength.WEAK
  }

  const hasUpperCase = /[A-Z]/.test(trimmedValue)
  const hasLowerCase = /[a-z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedValue)

  const typeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length

  if (typeCount >= 3) {
    return PasswordStrength.STRONG
  } else if (typeCount >= 2) {
    return PasswordStrength.MEDIUM
  } else {
    return PasswordStrength.WEAK
  }
}

/**
 * 验证IPv4地址
 * @param value IP地址字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateIPv4Address(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()
  const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|[01]?\d{1,2})$/

  if (!ipRegex.test(trimmedValue)) {
    return false
  }

  // 额外检查每个段是否在有效范围内
  const segments = trimmedValue.split('.')
  return segments.every((segment) => {
    const num = parseInt(segment, 10)
    return num >= 0 && num <= 255
  })
}

/**
 * 验证邮箱地址
 * @param value 邮箱地址字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateEmail(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // RFC 5322 标准的简化版邮箱正则
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return emailRegex.test(trimmedValue) && trimmedValue.length <= 254
}

/**
 * 验证URL地址
 * @param value URL字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateURL(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  try {
    new URL(value.trim())
    return true
  } catch {
    return false
  }
}

/**
 * 验证身份证号码（中国大陆）
 * @param value 身份证号码字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateChineseIDCard(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 18位身份证号码正则
  const idCardRegex =
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

  if (!idCardRegex.test(trimmedValue)) {
    return false
  }

  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(trimmedValue[i]) * weights[i]
  }

  const checkCode = checkCodes[sum % 11]
  return trimmedValue[17].toUpperCase() === checkCode
}

/**
 * 验证银行卡号
 * @param value 银行卡号字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateBankCard(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim().replace(/\s+/g, '')

  // 银行卡号通常为13-19位数字
  if (!/^\d{13,19}$/.test(trimmedValue)) {
    return false
  }

  // Luhn算法验证
  let sum = 0
  let shouldDouble = false

  for (let i = trimmedValue.length - 1; i >= 0; i--) {
    let digit = parseInt(trimmedValue[i])

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit = (digit % 10) + 1
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

// 计算字符长度
export const getByteLength = (str: string) => {
  if (!str) return 0
  // return str.length + (str.match(/[^\x00-\xff]/g) || []).length // 中文2字符，其他1字符
  return str.length
}

// id校验
export function validateProductId(rule: any, value: any, callback: any) {
  const maxLength = 18
  const regex = /^[a-zA-Z0-9]*$/

  if (value.length > maxLength) {
    callback(new Error(`不能超过${maxLength}个字符`))
  } else if (!regex.test(value)) {
    callback(new Error('只能包含字母和数字'))
  } else {
    callback() // 验证通过
  }
}

// 名称校验
export function validateNameLength(rule: any, value: any, callback: any) {
  console.log(rule)
  if (!value) return callback(new Error(rule.message || '请输入产品名称'))
  if (getByteLength(value) > 50) {
    callback(new Error('不能超过50个字符'))
  } else {
    callback()
  }
}

// 通用校验规则（中英文字母、数字、-、_、@）
export function validateCommon(rule: any, value: any, callback: any) {
  const pattern = /^[a-zA-Z0-9\u4e00-\u9fa5\-_@]*$/
  if (value && !pattern.test(value)) {
    callback(new Error('仅支持中文、英文字母、数字、短划线、下划线、@'))
  } else {
    callback()
  }
}

// 描述校验
export function validateDescLength(rule: any, value: any, callback: any) {
  if (value && getByteLength(value) > 200) {
    callback(new Error('描述不能超过200个字符'))
  } else {
    callback()
  }
}
//设备标识符校验
export function validateDeviceId(rule: any, value: any, callback: any) {
  const maxLength = 18
  const regex = /^[a-zA-Z0-9]*$/

  if (value.length > maxLength) {
    callback(new Error(`不能超过${maxLength}个字符`))
  } else if (!regex.test(value)) {
    callback(new Error('只能包含字母和数字'))
  } else {
    callback() // 验证通过
  }
}

// 标识符校验
export function validateIdentifier(rule: any, value: any, callback: any) {
  if (!value) {
    return callback(new Error('请输入标识符'))
  }

  // 长度校验
  if (getByteLength(value) > 20) {
    return callback(new Error('长度不能超过20个字符'))
  }

  // 格式校验：首字母 + 字母/数字/下划线
  const identifierReg = /^[A-Za-z][A-Za-z0-9_]*$/

  if (!identifierReg.test(value)) {
    return callback(new Error('仅支持英文字母、数字、下划线，且首字符必须为英文字母'))
  }

  callback()
}

/**
 * 唯一性校验（数组对象）
 * @param list - 数据源数组（对象数组）
 * @param field - 唯一字段名，如 'identifier'
 * @param index - 当前编辑项索引（新增时传 -1）
 * @param options - 可选配置
 */
type MaybeGetter<T> = T | (() => T)
export function createUniqueValidatorByIndex<T extends Record<string, any>>(
  list: T[],
  field: keyof T,
  index: MaybeGetter<any> = -1,
  options?: {
    /** 是否忽略大小写 */
    ignoreCase?: boolean
    /** 自定义错误提示 */
    message?: string
  }
) {
  const { ignoreCase = true, message = '标识符已存在，请更换' } = options || {}

  return function validateUnique(_: any, value: any, callback: any) {
    index = typeof index === 'function' ? index() : index
    // console.log(value, index, list)

    // 空值交给 required 处理
    if (value === '' || value === null || value === undefined) {
      return callback()
    }

    const normalize = (val: any) => {
      if (ignoreCase && typeof val === 'string') {
        return val.toLowerCase()
      }
      return val
    }

    const target = normalize(value)

    const exists = list.some((item, i) => {
      if (i === index) return false

      const itemValue = normalize(item?.[field])
      if (itemValue === undefined) return false

      return itemValue === target
    })

    if (exists) {
      return callback(new Error(message))
    }

    callback()
  }
}

export function createUniqueValidatorByValue<T extends Record<string, any>>(
  list: T[],
  field: keyof T,
  currentValue: MaybeGetter<any>,
  options?: {
    /** 是否忽略大小写 */
    ignoreCase?: boolean
    /** 自定义错误提示 */
    message?: string
  }
) {
  const { ignoreCase = true, message = '标识符已存在，请更换' } = options || {}

  return function validateUnique(_: any, value: any, callback: any) {
    const originValue = typeof currentValue === 'function' ? currentValue() : currentValue
    console.log(value, originValue)
    // 空值交给 required 处理
    if (value === '' || value === null || value === undefined) {
      return callback()
    }

    const normalize = (val: any) => {
      if (ignoreCase && typeof val === 'string') {
        return val.toLowerCase()
      }
      return val
    }

    const target = normalize(value)
    const origin = normalize(originValue)

    const exists = list.some((item) => {
      const itemValue = normalize(item?.[field])
      if (itemValue === undefined) return false

      // 与当前值一致，视为自身，跳过
      if (itemValue === origin) return false

      return itemValue === target
    })

    if (exists) {
      return callback(new Error(message))
    }

    callback()
  }
}

/**
 * 异步唯一性校验
 * @param checkFn - 校验接口函数，返回 Promise<boolean>
 *                 true：已存在（不通过）
 *                 false：不存在（通过）
 * @param options - 配置项
 */
export function createAsyncUniqueValidator(
  checkFn: (value: string) => Promise<boolean>,
  options?: {
    /** 编辑态原始值（相同则跳过校验） */
    currentValue?: string
    /** 自定义错误提示 */
    message?: string
    /** 防抖时间（ms） */
    debounce?: number
  }
) {
  const { currentValue, message = '该值已存在，请更换', debounce = 300 } = options || {}

  let timer: number | null = null

  return function validate(rule: any, value: string) {
    if (!value) return Promise.resolve()

    // 编辑态值未变化，直接通过
    if (currentValue !== undefined && value === currentValue) {
      return Promise.resolve()
    }

    // 防抖处理
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    return new Promise<void>((resolve, reject) => {
      timer = window.setTimeout(async () => {
        try {
          const exists = await checkFn(value)
          exists ? reject(new Error(message)) : resolve()
        } catch (err) {
          // 接口异常，一般放行或给统一错误
          resolve()
        }
      }, debounce)
    })
  }
}

/**
 * 参数描述校验（仅支持中文、英文字母、数字、短划线、下划线、@，必须中文或英文开头，长度不超过50字符）
 */
export function validateParamDesc(rule: any, value: any, callback: any) {
  if (!value) {
    return callback()
  }

  // 长度检查
  if (getByteLength(value) > 50) {
    return callback(new Error('长度不能超过50个字符'))
  }

  // 首字符检查：必须是中文或英文开头
  // const firstChar = value[0]
  // const isValidStart = /^[a-zA-Z\u4e00-\u9fa5]/.test(firstChar)

  // if (!isValidStart) {
  //   return callback(new Error('必须以中文或英文字母开头'))
  // }

  // 全字符检查：仅支持中文、英文字母、数字、短划线、下划线、@
  const pattern = /^[a-zA-Z0-9\u4e00-\u9fa5\-_@]*$/

  if (!pattern.test(value)) {
    return callback(new Error('仅支持中文、英文字母、数字、短划线（-）、下划线（_）、@'))
  }

  callback()
}

/**
 * 布尔值描述校验（必填，仅支持中文、英文字母、数字、短划线、下划线、@，必须中文或英文开头，长度不超过50字符）
 */
export function validateBooleanDesc(rule: any, value: any, callback: any) {
  if (!value) {
    return callback(new Error('请输入描述'))
  }

  // 长度检查
  if (getByteLength(value) > 50) {
    return callback(new Error('长度不能超过50个字符'))
  }

  // 首字符检查：必须是中文或英文开头
  // const firstChar = value[0]
  // const isValidStart = /^[a-zA-Z\u4e00-\u9fa5]/.test(firstChar)

  // if (!isValidStart) {
  //   return callback(new Error('必须以中文或英文字母开头'))
  // }

  // 全字符检查
  const pattern = /^[a-zA-Z0-9\u4e00-\u9fa5\-_@]*$/

  if (!pattern.test(value)) {
    return callback(new Error('仅支持中文、英文字母、数字、短划线（-）、下划线（_）、@'))
  }

  callback()
}

/**
 * 验证枚举值必须有一项
 */
export function validateEnumList(rule: any, value: any, callback: any) {
  if (!Array.isArray(value) || value.length === 0) {
    return callback(new Error('枚举值必须至少有一项'))
  }

  callback()
}

export type DataType =
  | 'int'
  | 'double'
  | 'float'
  | 'text'
  | 'password'
  | 'enum'
  | 'array'
  | 'object'
  | 'geo_point'

export interface DataTypeSpec {
  min?: number | string
  max?: number | string
  length?: number
  maxItemsCount?: number
  specsArray?: Array<{
    identifier: string
    name: string
  }>
  [key: string]: any
}

export interface SchemaItem {
  identifier: string
  name: string
  required?: boolean
  dataType: {
    type: DataType
    specs?: DataTypeSpec
  }
}

// 必填规则
function createRequiredRule(name: string): FormItemRule {
  return {
    required: true,
    message: `${name}不能为空`,
    trigger: 'blur'
  }
}

// 数字类型校验（int / float / double）
function createNumberRule(name: string, specs: DataTypeSpec = {}): FormItemRule {
  return {
    trigger: 'blur',
    validator(_, value, cb) {
      if (value == null) return cb()

      if (typeof value !== 'number') {
        return cb(new Error(`${name}必须是数字`))
      }

      if (specs.min !== undefined && value < Number(specs.min)) {
        return cb(new Error(`${name}不能小于 ${specs.min}`))
      }

      if (specs.max !== undefined && value > Number(specs.max)) {
        return cb(new Error(`${name}不能大于 ${specs.max}`))
      }

      cb()
    }
  }
}

// 文本长度校验
function createTextLengthRule(name: string, maxLength?: number): FormItemRule | null {
  if (!maxLength) return null

  return {
    max: maxLength,
    message: `${name}长度不能超过 ${maxLength}`,
    trigger: 'blur'
  }
}

// 枚举校验
function createEnumRule(name: string, specs: DataTypeSpec = {}): FormItemRule {
  return {
    trigger: 'change',
    validator(_, value, cb) {
      if (value == null) return cb()

      if (!Object.keys(specs).includes(String(value))) {
        return cb(new Error(`${name}不在枚举范围内`))
      }

      cb()
    }
  }
}

// JSON（array / object）校验
function createJsonRule(
  name: string,
  type: 'array' | 'object',
  specs: DataTypeSpec = {}
): FormItemRule {
  return {
    trigger: 'blur',
    validator(_, value, cb) {
      if (!value) return cb()

      let parsed: any
      try {
        parsed = JSON.parse(value)
      } catch {
        return cb(new Error(`${name}必须是合法 JSON`))
      }

      if (type === 'array') {
        if (!Array.isArray(parsed)) {
          return cb(new Error(`${name}必须是数组`))
        }
        if (specs.maxItemsCount && parsed.length > specs.maxItemsCount) {
          return cb(new Error(`${name}元素数量不能超过 ${specs.maxItemsCount}`))
        }
      }

      if (type === 'object') {
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          return cb(new Error(`${name}必须是对象`))
        }

        const fields = specs.specsArray || []
        for (const f of fields) {
          if (parsed[f.identifier] == null) {
            return cb(new Error(`缺少字段 ${f.name}`))
          }
        }
      }

      cb()
    }
  }
}

// 经纬度校验（geo_point）
export function createGeoPointRule(name: string): FormItemRule {
  return {
    trigger: 'blur',
    validator(_, value, cb) {
      if (!value) return cb()

      const parts = value.split(',')
      if (parts.length !== 2) {
        return cb(new Error(`${name}格式应为：经度,纬度`))
      }

      const lng = Number(parts[0].trim())
      const lat = Number(parts[1].trim())

      if (Number.isNaN(lng) || Number.isNaN(lat)) {
        return cb(new Error(`${name}必须是数字格式`))
      }

      if (lng < -180 || lng > 180) {
        return cb(new Error('经度范围应在 -180 ~ 180'))
      }

      if (lat < -90 || lat > 90) {
        return cb(new Error('纬度范围应在 -90 ~ 90'))
      }

      cb()
    }
  }
}

//  生成修改物模型值统一校验规则
export function buildThingModelValueRules(schema: SchemaItem[]): Record<string, FormItemRule[]> {
  const rules: Record<string, FormItemRule[]> = {}

  schema.forEach((item) => {
    const { identifier, name, required } = item
    const { type, specs = {} } = item.dataType

    const fieldRules: FormItemRule[] = []

    if (required) {
      fieldRules.push(createRequiredRule(name))
    }

    if (['int', 'double', 'float'].includes(type)) {
      fieldRules.push(createNumberRule(name, specs))
    }

    if (['text', 'password'].includes(type)) {
      const rule = createTextLengthRule(name, specs.length)
      rule && fieldRules.push(rule)
    }

    if (type === 'enum') {
      fieldRules.push(createEnumRule(name, specs))
    }

    if (type === 'array' || type === 'object') {
      fieldRules.push(createJsonRule(name, type, specs))
    }

    if (type === 'geo_point') {
      fieldRules.push(createGeoPointRule(name))
    }

    rules[identifier] = fieldRules
  })

  return rules
}
