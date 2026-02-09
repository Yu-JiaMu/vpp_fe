export default class CacheService {
  constructor({ prefix = '', max = 50, expire = 0 } = {}) {
    this.prefix = prefix
    this.max = max
    this.expire = expire
  }

  getKey(key) {
    return this.prefix ? `${this.prefix}_${key}` : key
  }

  get(key, expire) {
    if (typeof window === 'undefined') return null

    const raw = localStorage.getItem(this.getKey(key))
    if (!raw) return null

    try {
      const cache = JSON.parse(raw)
      if (!expire || Date.now() - cache.timestamp < expire) {
        return cache.data
      }
    } catch (e) {}

    localStorage.removeItem(this.getKey(key))
    return null
  }

  set(key, data) {
    if (typeof window === 'undefined') return

    localStorage.setItem(
      this.getKey(key),
      JSON.stringify({
        data,
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
