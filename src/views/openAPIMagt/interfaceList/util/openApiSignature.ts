/**
 * OpenAPI 签名请求工具类
 *
 * 提供 SM3/HMAC-SHA1 签名方式的 API 请求功能
 * 自动记录调用历史到 localStorage
 *
 * @module utils/iot/openApiSignature
 */

// ===================== SM3 签名实现 =====================

const SM3_T = new Uint32Array(64)
for (let i = 0; i < 16; i++) SM3_T[i] = 0x79CC4519
for (let i = 16; i < 64; i++) SM3_T[i] = 0x7A879D8A

function rotl32(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0
}

function ff(x: number, y: number, z: number, j: number): number {
  return j < 16 ? ((x ^ y ^ z) >>> 0) : (((x & y) | (x & z) | (y & z)) >>> 0)
}

function gg(x: number, y: number, z: number, j: number): number {
  return j < 16 ? ((x ^ y ^ z) >>> 0) : (((x & y) | (~x & z)) >>> 0)
}

function p0(x: number): number {
  return (x ^ rotl32(x, 9) ^ rotl32(x, 17)) >>> 0
}

function p1(x: number): number {
  return (x ^ rotl32(x, 15) ^ rotl32(x, 23)) >>> 0
}

function sm3Hash(msgBytes: Uint8Array): Uint8Array {
  const len = msgBytes.length
  const bitLen = len * 8

  let padLen = len + 1
  while (padLen % 64 !== 56) padLen++
  const padded = new Uint8Array(padLen + 8)
  padded.set(msgBytes)
  padded[len] = 0x80

  const view = new DataView(padded.buffer)
  view.setUint32(padLen, Math.floor(bitLen / 0x100000000), false)
  view.setUint32(padLen + 4, bitLen >>> 0, false)

  let V = new Uint32Array([
    0x7380166F, 0x4914B2B9, 0x172442D7, 0xDA8A0600,
    0xA96F30BC, 0x163138AA, 0xE38DEE4D, 0xB0FB0E4E
  ])

  const W = new Uint32Array(68)
  const W1 = new Uint32Array(64)

  for (let offset = 0; offset < padded.length; offset += 64) {
    const block = new DataView(padded.buffer, offset, 64)
    for (let i = 0; i < 16; i++) W[i] = block.getUint32(i * 4, false)
    for (let i = 16; i < 68; i++) {
      W[i] = (p1(W[i - 16] ^ W[i - 9] ^ rotl32(W[i - 3], 15)) ^ rotl32(W[i - 13], 7) ^ W[i - 6]) >>> 0
    }
    for (let i = 0; i < 64; i++) W1[i] = (W[i] ^ W[i + 4]) >>> 0

    let [A, B, C, D, E, F, G, H] = V
    for (let j = 0; j < 64; j++) {
      const SS1 = rotl32((rotl32(A, 12) + E + rotl32(SM3_T[j], j % 32)) >>> 0, 7)
      const SS2 = (SS1 ^ rotl32(A, 12)) >>> 0
      const TT1 = (ff(A, B, C, j) + D + SS2 + W1[j]) >>> 0
      const TT2 = (gg(E, F, G, j) + H + SS1 + W[j]) >>> 0
      D = C
      C = rotl32(B, 9)
      B = A
      A = TT1
      H = G
      G = rotl32(F, 19)
      F = E
      E = p0(TT2)
    }
    V[0] = (V[0] ^ A) >>> 0
    V[1] = (V[1] ^ B) >>> 0
    V[2] = (V[2] ^ C) >>> 0
    V[3] = (V[3] ^ D) >>> 0
    V[4] = (V[4] ^ E) >>> 0
    V[5] = (V[5] ^ F) >>> 0
    V[6] = (V[6] ^ G) >>> 0
    V[7] = (V[7] ^ H) >>> 0
  }

  const result = new Uint8Array(32)
  const rv = new DataView(result.buffer)
  for (let i = 0; i < 8; i++) rv.setUint32(i * 4, V[i], false)
  return result
}

function hmacSm3(keyBytes: Uint8Array, msgBytes: Uint8Array): Uint8Array {
  const blockSize = 64
  let key = keyBytes
  if (key.length > blockSize) {
    key = sm3Hash(key)
  }
  const paddedKey = new Uint8Array(blockSize)
  paddedKey.set(key)

  const ipad = new Uint8Array(blockSize)
  const opad = new Uint8Array(blockSize)
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36
    opad[i] = paddedKey[i] ^ 0x5C
  }

  const inner = new Uint8Array(blockSize + msgBytes.length)
  inner.set(ipad)
  inner.set(msgBytes, blockSize)
  const innerHash = sm3Hash(inner)

  const outer = new Uint8Array(blockSize + 32)
  outer.set(opad)
  outer.set(innerHash, blockSize)
  return sm3Hash(outer)
}

async function hmacSha1(keyStr: string, dataStr: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(keyStr), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(dataStr))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

// ===================== 工具函数 =====================

function buildStringToSign(
  method: string,
  path: string,
  queryString: string,
  timestamp: string,
  nonce: string
): string {
  return method + '\n' + path + '\n' + (queryString || '') + '\n' + timestamp + '\n' + nonce
}

function toBase64(uint8arr: Uint8Array): string {
  return btoa(String.fromCharCode(...uint8arr))
}

/**
 * 生成 UUID v4
 * 兼容不支持 crypto.randomUUID 的环境
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // 降级方案:手动生成 UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// ===================== 类型定义 =====================

/** 签名方式 */
export type SignMethod = 'SM3' | 'HMAC-SHA1'

/** HTTP 方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 请求参数配置 */
export interface OpenApiRequestOptions {
  /** 网关地址，例如：https://api.example.com */
  gatewayUrl: string
  /** 访问密钥 Key */
  accessKey: string
  /** 访问密钥 Secret */
  secretKey: string
  /** API 动作名称 */
  action: string
  /** 签名方式，默认 SM3 */
  signMethod?: SignMethod
  /** HTTP 方法，默认 GET */
  httpMethod?: HttpMethod
  /** 额外查询参数 */
  extraParams?: Record<string, any>
  /** API 接口 ID（用于缓存调用历史） */
  apiId?: string
}

/** 请求结果 */
export interface OpenApiResponse {
  /** 是否成功 */
  success: boolean
  /** HTTP 状态码 */
  statusCode: number
  /** 耗时（毫秒） */
  costTime: number
  /** 响应数据 */
  data: any
  /** 响应原始文本 */
  responseText: string
  /** 请求 URL */
  requestUrl: string
  /** 请求参数 */
  requestParams: Record<string, any>
  /** 请求头 */
  requestHeaders: Record<string, string>
  /** 响应头 */
  responseHeaders: Record<string, string>
  /** 错误信息 */
  error?: string
}

/** 调用历史记录 */
export interface CallHistoryRecord {
  /** 调用时间 */
  time: string
  /** API ID */
  apiId: string
  /** API 动作 */
  action: string
  /** 是否成功 */
  success: boolean
  /** 耗时（毫秒） */
  costTime: number
  /** HTTP 状态码 */
  statusCode: number
  /** 调用参数 */
  params: Record<string, any>
  /** 错误信息 */
  error?: string
}

export class OpenApiSignatureClient {
  /** 调用历史缓存 Key 前缀 */
  private static readonly HISTORY_KEY_PREFIX = 'openapi_call_history_'

  /** 默认网关路径 */
  private static readonly DEFAULT_PATH = '/openapi/api/v1'

  /**
   * 发送签名请求
   * @param options 请求配置
   * @returns 请求结果
   */
  async request(options: OpenApiRequestOptions): Promise<OpenApiResponse> {
    const {
      gatewayUrl,
      accessKey,
      secretKey,
      action,
      signMethod = 'SM3',
      httpMethod = 'GET',
      extraParams = {},
      apiId
    } = options

    const startTime = performance.now()

    try {
      const path = OpenApiSignatureClient.DEFAULT_PATH
      const timestamp = String(Date.now())
      const nonce = generateUUID()

      // 构建查询参数（按字母序排序）
      const params = new Map<string, string>()
      params.set('accessKey', accessKey)
      params.set('action', action)

      const orgParams = new Map<string, string>();
      orgParams.set('accessKey', accessKey)
      orgParams.set('action', action)
      // 添加原始参数用于加密
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          orgParams.set(key, String(value))
        }
      })
      // 添加额外参数
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, encodeURIComponent(String(value)))
        }
      })

      // 按字母序排列
      const orgSortedKeys = [...orgParams.keys()].sort()
      const orgQueryString = orgSortedKeys.map((k) => `${k}=${orgParams.get(k)}`).join('&')
      console.log("orgQueryString", orgQueryString);

      // 按字母序排列
      const sortedKeys = [...params.keys()].sort()
      const queryString = sortedKeys.map((k) => `${k}=${params.get(k)}`).join('&')
      console.log("queryString", queryString);

      // 构建待签名字符串
      const stringToSign = buildStringToSign(httpMethod, path, orgQueryString, timestamp, nonce)

      // 计算签名
      let signature: string
      if (signMethod === 'SM3') {
        const enc = new TextEncoder()
        const sigBytes = hmacSm3(enc.encode(secretKey), enc.encode(stringToSign))
        signature = toBase64(sigBytes)
      } else {
        signature = await hmacSha1(secretKey, stringToSign)
      }

      // 构建完整 URL
      const fullUrl = `${gatewayUrl}${path}?${queryString}`

      // 请求头
      const headers: Record<string, string> = {
        'X-Access-Key': accessKey,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
        'X-Signature-Method': signMethod,
        'Accept': 'application/json'
      }

      // 发送请求
      const response = await fetch(fullUrl, {
        method: httpMethod,
        headers,
        mode: 'cors'
      })

      const elapsed = performance.now() - startTime
      const statusCode = response.status
      const responseText = await response.text()

      // 尝试解析 JSON
      let data: any
      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }

      // 获取响应头
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const result: OpenApiResponse = {
        success: data.code === 200,
        statusCode,
        costTime: Math.round(elapsed),
        data,
        responseText,
        requestUrl: fullUrl,
        requestParams: Object.fromEntries(params),
        requestHeaders: headers,
        responseHeaders
      }

      // 保存调用历史
      if (apiId) {
        this.saveCallHistory(apiId, action, result)
      }

      return result
    } catch (error: any) {
      const elapsed = performance.now() - startTime

      const errorResult: OpenApiResponse = {
        success: false,
        statusCode: 0,
        costTime: Math.round(elapsed),
        data: null,
        responseText: '',
        requestUrl: '',
        requestParams: Object.fromEntries(
            Object.entries(extraParams).map(([k, v]) => [k, String(v)])
        ),
        requestHeaders: {},
        responseHeaders: {},
        error: error.message
      }

      // 保存调用历史（失败情况）
      if (apiId) {
        this.saveCallHistory(apiId, action, errorResult)
      }

      return errorResult
    }
  }

  /**
   * 保存调用历史到 localStorage
   * @param apiId API ID
   * @param action API 动作
   * @param response 请求结果
   */
  private saveCallHistory(
    apiId: string,
    action: string,
    response: OpenApiResponse
  ): void {
    try {
      const historyKey = `${OpenApiSignatureClient.HISTORY_KEY_PREFIX}${apiId}`
      const existingHistory = localStorage.getItem(historyKey)
      const history: CallHistoryRecord[] = existingHistory
        ? JSON.parse(existingHistory)
        : []

      const record: CallHistoryRecord = {
        time: formatDateTime(new Date()),
        apiId,
        action,
        success: response.success,
        costTime: response.costTime,
        statusCode: response.statusCode,
        params: response.requestParams,
        error: response.error
      }

      // 最新记录放在最前面，最多保留 50 条
      history.unshift(record)
      if (history.length > 50) {
        history.length = 50
      }

      localStorage.setItem(historyKey, JSON.stringify(history))
    } catch (error) {
      console.error('[OpenApiSignature] 保存调用历史失败:', error)
    }
  }

  /**
   * 获取指定 API 的调用历史
   * @param apiId API ID
   * @returns 调用历史记录列表
   */
  getCallHistory(apiId: string): CallHistoryRecord[] {
    try {
      const historyKey = `${OpenApiSignatureClient.HISTORY_KEY_PREFIX}${apiId}`
      const existingHistory = localStorage.getItem(historyKey)
      return existingHistory ? JSON.parse(existingHistory) : []
    } catch (error) {
      console.error('[OpenApiSignature] 获取调用历史失败:', error)
      return []
    }
  }

  /**
   * 清除指定 API 的调用历史
   * @param apiId API ID
   */
  clearCallHistory(apiId: string): void {
    try {
      const historyKey = `${OpenApiSignatureClient.HISTORY_KEY_PREFIX}${apiId}`
      localStorage.removeItem(historyKey)
    } catch (error) {
      console.error('[OpenApiSignature] 清除调用历史失败:', error)
    }
  }

  /**
   * 清除所有调用历史
   */
  clearAllCallHistory(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(OpenApiSignatureClient.HISTORY_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('[OpenApiSignature] 清除所有调用历史失败:', error)
    }
  }
}


// ===================== 参数校验 =====================

/**
 * 校验必填参数
 * @param params 参数数组（从 paramsConfigData 导入的数据）
 * @param pageParams 分页参数数组（从 pageParamsConfigData 导入的数据）
 * @param apiId 当前 API 的 ID
 * @returns 校验结果 { valid: boolean, missingParams: string[] }
 */
export function validateRequiredParams(
  params: any[],
  pageParams: any[],
  apiId: string
): { valid: boolean; missingParams: string[] } {
  const missingParams: string[] = []

  // 校验输入参数
  params.forEach((item) => {
    // 检查当前 API 是否需要此参数
    if (item.needId && item.needId.includes(apiId)) {
      // 检查当前 API 是否必填
      if (item.isRequired && item.isRequired.includes(apiId)) {
        // 检查值是否为空
        if (!item.value || String(item.value).trim() === '') {
          missingParams.push(item.cnLabel || item.label)
        }
      }
    }
  })

  // 校验分页参数（如果需要）
  pageParams.forEach((item) => {
    if (item.required) {
      if (item.value === undefined || item.value === null || item.value === '') {
        missingParams.push(item.cnLabel || item.label)
      }
    }
  })

  return {
    valid: missingParams.length === 0,
    missingParams
  }
}
export const openApiClient = new OpenApiSignatureClient()

