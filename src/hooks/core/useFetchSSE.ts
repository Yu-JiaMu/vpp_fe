import { ref, getCurrentInstance, onUnmounted } from 'vue'
import { useUserStore } from '@/store/modules/user'

type MessageHandler = (data: any) => void

type UseSSEStreamOptions = {
  immediate?: boolean
  onMessage?: MessageHandler
}

export function useFetchSSE(initialUrl?: string, options: UseSSEStreamOptions = {}) {
  const { immediate = true, onMessage } = options
  const userStore = useUserStore()

  const url = ref<string | undefined>(initialUrl)

  const data = ref<any>(null)
  const status = ref<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle')
  const error = ref<any>(null)

  let controller: AbortController | null = null
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  /** 消息订阅列表 */
  const messageHandlers = new Set<MessageHandler>()

  if (onMessage) {
    messageHandlers.add(onMessage)
  }

  const emitMessage = (payload: any) => {
    data.value = payload
    messageHandlers.forEach((fn) => fn(payload))
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

      if (!res.ok || !res.body) {
        throw new Error(`SSE failed: ${res.status}`)
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
      if (err.name === 'AbortError') return
      error.value = err
      status.value = 'error'
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
    onMessage: onMessageRegister
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
