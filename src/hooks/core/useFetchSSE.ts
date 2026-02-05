import { ref, getCurrentInstance, onUnmounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

type MessageHandler = (data: any) => void
type ErrorHandler = (err: any) => void

type UseSSEStreamOptions = {
  immediate?: boolean
  onMessage?: MessageHandler
  onError?: ErrorHandler
}

export function useFetchSSE(initialUrl?: string, options: UseSSEStreamOptions = {}) {
  const { immediate = true, onMessage, onError } = options
  const userStore = useUserStore()

  const url = ref<string | undefined>(initialUrl)

  const data = ref<any>(null)
  const status = ref<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle')
  const error = ref<any>(null)

  let controller: AbortController | null = null
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  /** 消息订阅列表 */
  const messageHandlers = new Set<MessageHandler>()
  /** 错误订阅列表 */
  const errorHandlers = new Set<ErrorHandler>()

  if (onMessage) {
    messageHandlers.add(onMessage)
  }

  if (onError) {
    errorHandlers.add(onError)
  }

  const emitMessage = (payload: any) => {
    data.value = payload
    messageHandlers.forEach((fn) => fn(payload))
  }

  const emitError = (err: any) => {
    error.value = err
    errorHandlers.forEach((fn) => fn(err))
  }

  const start = async (newUrl?: string) => {
    if (status.value === 'connecting' || status.value === 'open') return

    if (newUrl) {
      url.value = newUrl
    }

    if (!url.value) {
      throw new Error('useFetchSSE: url is required')
    }

    status.value = 'connecting'
    controller = new AbortController()

    try {
      const res = await fetch(url.value, {
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`
        },
        signal: controller.signal
      })
      // console.log(res)

      // 1. HTTP 层
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.msg || '服务端异常')
      }

      // 2. Content-Type 层
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const err = await res.json()
        if (err?.code) {
          throw new Error(err.msg)
        }
      }

      status.value = 'open'

      reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          const parsed = parseData(event)

          if (parsed !== null) {
            emitMessage(parsed)
          }
        }
      }

      stop()
    } catch (err: any) {
      console.log('error', err)

      if (err.name === 'AbortError') return
      ElMessage.error(err.message)
      error.value = err
      status.value = 'error'
      emitError(err)
      stop()
    }
  }

  const stop = () => {
    if (reader) {
      reader.cancel().catch(() => {})
      reader = null
    }

    if (controller) {
      controller.abort()
      controller = null
    }

    status.value = 'closed'
  }

  /** 注册消息监听 */
  const onMessageRegister = (handler: MessageHandler) => {
    messageHandlers.add(handler)
    return () => messageHandlers.delete(handler) // 支持取消监听
  }

  /** 注册错误监听 */
  const onErrorRegister = (handler: ErrorHandler) => {
    errorHandlers.add(handler)
    return () => errorHandlers.delete(handler)
  }

  if (getCurrentInstance()) {
    onUnmounted(stop)
  }

  if (immediate && initialUrl) {
    start()
  }

  return {
    data,
    status,
    error,
    start,
    stop,
    onMessage: onMessageRegister,
    onError: onErrorRegister
  }
}

function parseData(chunk: string): any | null {
  const lines = chunk.split('\n')
  let data = ''

  for (const line of lines) {
    if (line.startsWith('data:')) {
      data += line.replace(/^data:\s?/, '')
    }
  }

  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}
