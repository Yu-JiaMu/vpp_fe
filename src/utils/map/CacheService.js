export default class CacheService {
  constructor({ prefix = '', max = 50 } = {}) {
    this.prefix = prefix
    this.max = max
  }

  getKey(key) {
    return this.prefix ? `${this.prefix}_${key}` : key
  }

  get(key) {
    if (typeof window === 'undefined') return null

    const raw = localStorage.getItem(this.getKey(key))
    if (!raw) return null

    try {
      const cache = JSON.parse(raw)
      const { data, timestamp, expire } = cache

      // 没有 expire = 永不过期
      if (!expire || Date.now() - timestamp < expire) {
        return data
      }
    } catch (e) {}

    // 过期 or 异常 → 清理
    localStorage.removeItem(this.getKey(key))
    return null
  }

  set(key, data, expire = 0) {
    if (typeof window === 'undefined') return

    localStorage.setItem(
      this.getKey(key),
      JSON.stringify({
        data,
        expire, // 👈 写时绑定
        timestamp: Date.now()
      })
    )
  }

  remove(key) {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.getKey(key))
  }

  clear() {
    if (typeof window === 'undefined') return

    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => localStorage.removeItem(k))
  }
}
