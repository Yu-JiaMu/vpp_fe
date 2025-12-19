import dayjs from 'dayjs'

const mode = import.meta.env.VITE_ROUTER_MODE as 'hash' | 'history'

/**
 * @description 获取localStorage
 * @param {String} key Storage名称
 * @returns {String}
 */
export function localGet(key: string) {
  const value = window.localStorage.getItem(key)
  try {
    return JSON.parse(window.localStorage.getItem(key) as string)
  } catch (error) {
    return value
  }
}

/**
 * @description 存储localStorage
 * @param {String} key Storage名称
 * @param {*} value Storage值
 * @returns {void}
 */
export function localSet(key: string, value: any) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

/**
 * @description 清除localStorage
 * @param {String} key Storage名称
 * @returns {void}
 */
export function localRemove(key: string) {
  window.localStorage.removeItem(key)
}

/**
 * @description 清除所有localStorage
 * @returns {void}
 */
export function localClear() {
  window.localStorage.clear()
}

/**
 * @description 判断数据类型
 * @param {*} val 需要判断类型的数据
 * @returns {String}
 */
export function isType(val: any) {
  if (val === null) return 'null'
  if (typeof val !== 'object') return typeof val
  else return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase()
}

/**
 * @description 生成唯一 uuid
 * @returns {String}
 */
export function generateUUID() {
  let uuid = ''
  for (let i = 0; i < 32; i++) {
    let random = (Math.random() * 16) | 0
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-'
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16)
  }
  return uuid
}

/**
 * 判断两个对象是否相同
 * @param {Object} a 要比较的对象一
 * @param {Object} b 要比较的对象二
 * @returns {Boolean} 相同返回 true，反之 false
 */
export function isObjectValueEqual(a: { [key: string]: any }, b: { [key: string]: any }) {
  if (!a || !b) return false
  let aProps = Object.getOwnPropertyNames(a)
  let bProps = Object.getOwnPropertyNames(b)
  if (aProps.length != bProps.length) return false
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i]
    let propA = a[propName]
    let propB = b[propName]
    if (!b.hasOwnProperty(propName)) return false
    if (propA instanceof Object) {
      if (!isObjectValueEqual(propA, propB)) return false
    } else if (propA !== propB) {
      return false
    }
  }
  return true
}

/**
 * @description 生成随机数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @returns {Number}
 */
export function randomNum(min: number, max: number): number {
  let num = Math.floor(Math.random() * (min - max) + max)
  return num
}

/**
 * @description 获取当前时间对应的提示语
 * @returns {String}
 */
export function getTimeState() {
  let timeNow = new Date()
  let hours = timeNow.getHours()
  if (hours >= 6 && hours <= 10) return `早上好 ⛅`
  if (hours >= 10 && hours <= 14) return `中午好 🌞`
  if (hours >= 14 && hours <= 18) return `下午好 🌞`
  if (hours >= 18 && hours <= 24) return `晚上好 🌛`
  if (hours >= 0 && hours <= 6) return `凌晨好 🌛`
}

/**
 * @description 获取浏览器默认语言
 * @returns {string}
 */
export function getBrowserLang(): string {
  const browserLang = navigator.language || ''
  let defaultBrowserLang = ''

  if (['cn', 'zh', 'zh-cn'].includes(browserLang.toLowerCase())) {
    defaultBrowserLang = 'zh'
  } else {
    defaultBrowserLang = 'en'
  }

  return defaultBrowserLang
}

/**
 * @description 获取不同路由模式所对应的 url + params
 * @returns {String}
 */
export function getUrlWithParams() {
  const url = {
    hash: location.hash.substring(1),
    history: location.pathname + location.search
  }
  return url[mode]
}

/**
 * 访问localStorage接口，支持直接读写object。这里的取值表示是否在读取过一次后就Delete。 法同sessionStorage
 */
export const localStorage = initStorage(window.localStorage, {} as Record<string, boolean>)
export const sessionStorage = initStorage(window.sessionStorage, {} as Record<string, boolean>)

/**
 * 初始化storage代理
 * @param {Storage} stub - Storage对象，可以是window.localStorage或window.sessionStorage
 * @param {Record<string, boolean>} propMap - 一个映射，用来指定哪些键在读取后会删除
 */
function initStorage(stub: Storage, propMap: Record<string, boolean>) {
  return new Proxy(
    {},
    {
      get(target: any, key: string): any {
        return getItem(key, propMap[key])
      },
      set(target: any, key: string, value: any): boolean {
        setItem(key, value)
        return true // 必须返回true，否则会抛出错误
      }
    }
  )

  // 获取存储项
  function getItem(key: string, isOneshot: boolean): any {
    const realKey = getRealKey(key)
    let value: any = stub.getItem(realKey)
    if (value !== null && value !== undefined) {
      try {
        value = JSON.parse(value)
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.error(`can't parse [${realKey}]: ${value}`)
          removeItem(key)
        } else {
          console.error(e)
        }
        value = undefined
      }
      if (isOneshot) {
        removeItem(key)
      }
    }
    return value
  }

  // 设置存储项
  function setItem(key: string, value: any): void {
    if (value === undefined) {
      removeItem(key)
      return
    }
    const realKey = getRealKey(key)
    try {
      stub.setItem(realKey, JSON.stringify(value))
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError' && stub.length) {
        // 空间不足
        stub.clear()
        stub.setItem(realKey, JSON.stringify(value))
      } else {
        console.error(e)
      }
    }
  }

  // 删除存储项
  function removeItem(key: string): void {
    const realKey = getRealKey(key)
    try {
      stub.removeItem(realKey)
    } catch (e) {
      console.error(e)
    }
  }

  // 获取实际存储的键名
  function getRealKey(key: string): string {
    return key // 如果需要在实际键名上做修改，可以在这里调整
  }
}

/**
 * 把unix时间戳转为其他格式显示
 * @param timestamp
 * @param format
 * @returns
 */
export function formatTimestamp(timestamp: any, format = 'YYYY-MM-DD HH:mm:ss', isNow = false) {
  if (isNow) {
    timestamp = Date.now() / 1000
  }
  if (!timestamp) return ''
  return dayjs(timestamp * 1000).format(format)
}

type BlobPart = BufferSource | Blob | string

/**
 * 下载文件的工具函数
 * @param result - 文件的二进制数据或 Blob 数据
 * @param fileName - 下载文件的名称，默认为 '导出数据'
 */
export function downloadFile(result: Blob | ArrayBuffer | Uint8Array, fileName = '导出数据'): void {
  const blob: Blob = result instanceof Blob ? result : new Blob([result as BlobPart])

  const downloadElement = document.createElement('a')
  const href = URL.createObjectURL(blob)

  downloadElement.href = href

  // ⚠️ Windows 不允许文件名包含 :
  const safeTime = dayjs().format('YYYY-MM-DD_HH-mm-ss')
  downloadElement.download = `${fileName}-${safeTime}.xlsx`

  document.body.appendChild(downloadElement)
  downloadElement.click()
  document.body.removeChild(downloadElement)

  URL.revokeObjectURL(href)
}

/**
 * 手机号脱敏
 * @param phone
 * @returns
 */
export function maskPhoneNumber(phone: string): string {
  // 确保输入是一个合法的手机号
  if (!/^\d{11}$/.test(phone)) {
    return ''
  }

  // 使用正则表达式进行脱敏处理
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

/**
 * 下载文件的工具函数
 * @param num - 生成几位数
 */
export function generateThreeDigitRandomNumber(num: number) {
  let randomNum = Math.floor(Math.random() * 1000) // 生成0到999之间的随机数
  let formattedNum = randomNum.toString().padStart(num, '0') // 确保是三位数，不足则补零
  return formattedNum
}
