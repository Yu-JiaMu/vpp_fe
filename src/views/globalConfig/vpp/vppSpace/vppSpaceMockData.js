/**
 * 虚拟电厂空间 mock 数据生成函数
 */

const vppNames = [
  '广州天河智慧能源虚拟电厂',
  '深圳南山储能虚拟电厂',
  '成都高新负荷聚合虚拟电厂',
  '广州黄埔光伏虚拟电厂',
  '深圳宝安充电桩虚拟电厂',
  '成都锦江商业楼宇虚拟电厂',
  '广州越秀分布式能源虚拟电厂',
  '深圳福田数据中心虚拟电厂',
  '成都武侯工业园区虚拟电厂',
  '广州白云冷热电联供虚拟电厂',
  '深圳龙华电动汽车虚拟电厂',
  '成都成华氢能虚拟电厂',
  '广州番禺柔性负荷虚拟电厂',
  '深圳坪山储能电站虚拟电厂',
  '成都温江区域综合能源虚拟电厂'
]

const operatorNames = [
  '广东绿色能源科技有限公司',
  '深圳智慧能源有限公司',
  '浙江新能源电力有限公司',
  '北京清能电力技术有限公司',
  '江苏华电能源科技有限公司',
  '四川蜀能电力有限公司',
  '山东鲁能智慧能源有限公司',
  '福建海电能源有限公司',
  '湖南湘电能源科技有限公司',
  '安徽皖能电力技术有限公司'
]

const statuses = [1, 1, 1, 1, 1, 2, 3, 1, 1, 2]

const regionNames = [
  '广东省广州市', '广东省深圳市', '四川省成都市',
  '广东省广州市', '广东省深圳市', '四川省成都市',
  '广东省广州市', '广东省深圳市', '四川省成都市',
  '广东省广州市', '广东省深圳市', '四川省成都市',
  '广东省广州市', '广东省深圳市', '四川省成都市'
]

const vppTypes = [1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2]

const marketStatuses = [2, 2, 2, 1, 2, 2, 3, 2, 1, 2, 2, 2, 1, 2, 2]

const policyRegionOptions = [
  ['广东省', '华北电力市场'],
  ['广东省', '南方电力市场'],
  ['四川省', '西南电力市场'],
  ['浙江省', '华东电力市场'],
  ['江苏省', '华东电力市场'],
  ['北京市', '华北电力市场']
]

function randomDate(startDays, endDays) {
  const now = Date.now()
  const offset = (Math.random() * (endDays - startDays) + startDays) * 86400000
  return new Date(now + offset).toISOString()
}

function pickRandom(arr, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * 生成虚拟电厂空间 mock 详情
 * @param {number|string} id - 虚拟电厂 ID
 * @returns {Object}
 */
export function generateMockVppSpaceDetail(id) {
  const numId = Number(id)
  const idx = (numId - 200000) % vppNames.length
  const statusIdx = (numId - 200000) % statuses.length
  const descriptions = [
    '采用先进的AI算法对分布式能源进行智能调度，实现区域能源最优配置。',
    '整合区域内储能资源，提供削峰填谷、需求响应等辅助服务。',
    '聚合工业园区柔性负荷，参与电力市场交易，降低企业用电成本。',
    '统筹管理分布式光伏发电，实现清洁能源高效利用和并网运行。',
    '搭建电动汽车V2G平台，利用车载电池参与电网调频调峰。',
    '对商业楼宇进行能效管理，通过需求响应获取收益。',
    '集成多种分布式能源资源，打造区域综合能源服务平台。',
    '利用数据中心余热回收及UPS储能，提供灵活调节能力。',
    '构建工业园区的多能互补系统，提升能源综合利用效率。',
    '通过冷热电三联供技术，实现能源的梯级利用和优化调度。'
  ]

  return {
    id: numId,
    vppCode: `VPP${String(300000 + (numId - 200000)).slice(-6)}`,
    vppName: vppNames[idx],
    operatorName: operatorNames[idx % operatorNames.length],
    vppType: vppTypes[idx],
    marketAccessStatus: marketStatuses[idx],
    vppStatusFlag: statuses[statusIdx],
    region: regionNames[idx],
    longitude: (113.2 + (numId % 50) * 0.1).toFixed(6),
    latitude: (23.1 + (numId % 30) * 0.1).toFixed(6),
    description: descriptions[idx % descriptions.length],
    policyRegions: pickRandom(policyRegionOptions, 1, 2).map(r => r.join(' - ')),
    createdAt: randomDate(-365, -30),
    expireDate: statuses[statusIdx] === 2
      ? randomDate(-60, -1)
      : randomDate(30, 730),
    orgId: `org_${1000 + idx}`
  }
}

/**
 * 生成虚拟电厂空间样例数据
 * @param {number} count - 生成数量
 * @returns {Array}
 */
export function generateMockVppSpaces(count = 15) {
  return Array.from({ length: count }, (_, i) => {
    const idx = i % vppNames.length
    const statusIdx = i % statuses.length

    return {
      id: 200000 + i,
      vppCode: `VPP${String(300000 + i).slice(-6)}`,
      vppName: vppNames[idx],
      operatorName: operatorNames[idx % operatorNames.length],
      vppType: vppTypes[idx],
      marketAccessStatus: marketStatuses[idx],
      vppStatusFlag: statuses[statusIdx],
      region: regionNames[i % regionNames.length],
      createdAt: randomDate(-365, -30),
      expireDate: statuses[statusIdx] === 2
        ? randomDate(-60, -1)
        : randomDate(30, 730),
      orgId: `org_${1000 + i}`
    }
  })
}
