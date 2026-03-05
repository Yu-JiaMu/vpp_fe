/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author zhu
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'
import { AxiosCanceler } from './helper/axiosCancel'
import { cleanEmptyValues, isPlainObject } from '@/utils'

/** 自定义请求扩展字段 */
interface RequestExtraOptions {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
  retry?: number
  cancel?: boolean
  loading?: boolean
  fullLoading?: boolean
  isSign?: boolean
  skipClean?: boolean
}

/** 外部使用（request / api.get 等） */
export type ExtendedAxiosRequestConfig = AxiosRequestConfig & RequestExtraOptions

/** 拦截器内部使用 */
export type CustomAxiosRequestConfig = InternalAxiosRequestConfig & RequestExtraOptions

const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000
const DEFAULT_RETRY_POLICY = {
  baseDelay: 500, // 初始延迟
  maxDelay: 8000, // 最大延迟
  jitter: true // 防止惊群
}

class HttpRequest {
  private instance: AxiosInstance
  private axiosCanceler = new AxiosCanceler()
  private isUnauthorizedErrorShown = false
  private unauthorizedTimer: NodeJS.Timeout | null = null

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  /** 配置拦截器 */
  private setupInterceptors() {
    // 请求拦截
    this.instance.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const { accessToken } = useUserStore()

        // 重复请求处理
        config.cancel ?? (config.cancel = true)
        config.cancel && this.axiosCanceler.addPending(config)

        // Token 注入
        if (accessToken) config.headers.set('Authorization', accessToken)

        if (!config.skipClean) {
          // query 参数去空处理
          if (config.params && isPlainObject(config.params)) {
            config.params = cleanEmptyValues(config.params)
          }

          // body 数据（仅普通对象）去空处理
          if (config.data && isPlainObject(config.data) && !(config.data instanceof FormData)) {
            config.data = cleanEmptyValues(config.data)
          }
        }

        // 数据序列化处理 (针对非 FormData 且未设置 Content-Type 的情况)
        if (config.data && !(config.data instanceof FormData) && !config.headers['Content-Type']) {
          config.headers.set('Content-Type', 'application/json')
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截
    this.instance.interceptors.response.use(
      (response: AxiosResponse<BaseResponse>) => {
        const { data, config, status } = response

        this.axiosCanceler.removePending(config)

        if (
          status === ApiStatus.success &&
          (config.responseType === 'blob' || config.responseType === 'arraybuffer')
        ) {
          return response
        }

        if (data.code === ApiStatus.success) return response

        if (data.code === ApiStatus.unauthorized) {
          this.handleUnauthorizedError(data.msg)
        }

        throw new HttpError(data.msg || $t('httpMsg.requestFailed'), data.code)
      },
      (error) => {
        if (error.response?.status === ApiStatus.unauthorized) {
          this.handleUnauthorizedError()
        }
        return Promise.reject(handleError(error))
      }
    )
  }

  /** 处理 401 错误 */
  private handleUnauthorizedError(message?: string): never {
    const msg = message || $t('httpMsg.unauthorized')
    const error = new HttpError(msg, ApiStatus.unauthorized)

    if (!this.isUnauthorizedErrorShown) {
      this.isUnauthorizedErrorShown = true

      // 延迟退出登录
      setTimeout(() => useUserStore().logOut(), LOGOUT_DELAY)

      // 防抖重置
      this.unauthorizedTimer = setTimeout(() => {
        this.isUnauthorizedErrorShown = false
        if (this.unauthorizedTimer) clearTimeout(this.unauthorizedTimer)
      }, UNAUTHORIZED_DEBOUNCE_TIME)

      showError(error, true)
    }

    throw error
  }

  private getRetryDelay(attempt: number) {
    const { baseDelay, maxDelay, jitter } = DEFAULT_RETRY_POLICY

    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)

    return jitter ? Math.random() * delay : delay
  }

  /** 核心请求方法（带重试逻辑） */
  async request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
    const maxRetries = config.retry ?? 0
    let attempt = 0

    while (true) {
      try {
        const res = await this.instance.request<BaseResponse<T>>(config)
        // console.log('res', res)

        if (config.showSuccessMessage && res.data.msg) {
          showSuccess(res.data.msg)
        }

        if (res.data.data !== undefined) {
          return res.data.data as T
        }

        return res.data as T
      } catch (error) {
        const canRetry =
          error instanceof HttpError &&
          error.code !== ApiStatus.unauthorized &&
          attempt < maxRetries

        if (!canRetry) {
          if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
            const showMsg = config.showErrorMessage !== false
            showError(error, showMsg)
          }
          throw error
        }

        const delay = this.getRetryDelay(attempt)
        attempt++

        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // 封装快捷方法
  get<T>(url: string, params?: any, config?: ExtendedAxiosRequestConfig) {
    return this.request<T>({ ...config, url, params, method: 'GET' })
  }

  post<T>(url: string, data?: any, config?: ExtendedAxiosRequestConfig) {
    return this.request<T>({ ...config, url, data, method: 'POST' })
  }

  put<T>(url: string, data?: any, config?: ExtendedAxiosRequestConfig) {
    return this.request<T>({ ...config, url, data, method: 'PUT' })
  }

  delete<T>(url: string, params?: any, config?: ExtendedAxiosRequestConfig) {
    return this.request<T>({ ...config, url, params, method: 'DELETE' })
  }

  async download(url: string, params?: object, config?: ExtendedAxiosRequestConfig): Promise<Blob> {
    const response = await this.instance.request<Blob>({
      ...config,
      url,
      params,
      method: 'GET',
      responseType: 'blob'
    })
    return response.data
  }
}

/** 实例化 */
const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

const api = new HttpRequest({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true'
})

export default api
