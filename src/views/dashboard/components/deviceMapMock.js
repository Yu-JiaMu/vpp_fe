/**
 * 生成高级mock设备数据
 * @param {number} [count=1000] - 生成的设备数量
 * @param {object} [options] - 选项
 * @param {number} [options.center=[104.065735, 30.659462]] - 设备分布中心
 * @param {number} [options.spread=0.3] - 设备分布范围
 * @param {boolean} [options.cluster=false] - 是否聚集
 * @returns {array} - 生成的设备列表
 */
export function generateMockDevicesAdvanced(count = 1000, options = {}) {
  const {
    center = [104.08392, 30.389842],
    spread = 0.3, // 分布范围
    cluster = false // 是否聚集
  } = options

  const list = []

  for (let i = 0; i < count; i++) {
    let lng, lat

    if (cluster) {
      // 👉 模拟热点聚集（更真实）
      const hotspot = [
        center[0] + (Math.random() - 0.5) * 0.1,
        center[1] + (Math.random() - 0.5) * 0.1
      ]

      lng = hotspot[0] + (Math.random() - 0.5) * 0.02
      lat = hotspot[1] + (Math.random() - 0.5) * 0.02
    } else {
      // 👉 均匀分布
      lng = center[0] + (Math.random() - 0.5) * spread
      lat = center[1] + (Math.random() - 0.5) * spread
    }

    list.push({
      lnglat: [lng, lat],
      name: `设备${i + 1}`,
      productName: `测试产品${(i % 10) + 1}`,
      nodeType: 'gateway-sub-device',
      devState: Math.random() > 0.7 ? 'offLine' : 'onLine',
      address: `成都市高新区${i + 1}号`,
      id: `${i}_${Math.random().toString(36).slice(2)}`
    })
  }

  return list
}
