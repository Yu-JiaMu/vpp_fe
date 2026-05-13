/**
 * 运营商 mock 数据生成函数
 */

const companyNames = [
  '广东绿色能源科技有限公司',
  '深圳智慧能源有限公司',
  '浙江新能源电力有限公司',
  '北京清能电力技术有限公司',
  '江苏华电能源科技有限公司',
  '四川蜀能电力有限公司',
  '山东鲁能智慧能源有限公司',
  '福建海电能源有限公司',
  '湖南湘电能源科技有限公司',
  '安徽皖能电力技术有限公司',
  '湖北楚能新能源有限公司',
  '河南豫电能源科技有限公司',
  '河北冀能电力有限公司',
  '陕西秦电能源技术有限公司',
  '上海浦电能科技有限公司'
]

const regions = [
  { province: '广东省', city: '广州市' },
  { province: '广东省', city: '深圳市' },
  { province: '浙江省', city: '杭州市' },
  { province: '北京市', city: '北京市' },
  { province: '江苏省', city: '南京市' },
  { province: '四川省', city: '成都市' },
  { province: '山东省', city: '济南市' },
  { province: '福建省', city: '福州市' },
  { province: '湖南省', city: '长沙市' },
  { province: '安徽省', city: '合肥市' }
]

const statuses = [1, 1, 1, 1, 1, 2, 3, 1, 1, 2]

/**
 * 生成随机日期
 */
function randomDate(startDays, endDays) {
  const now = Date.now()
  const offset = (Math.random() * (endDays - startDays) + startDays) * 86400000
  return new Date(now + offset).toISOString()
}

/**
 * 生成运营商样例数据
 * @param {number} count - 生成数量
 * @returns {Array}
 */
export function generateMockOperators(count = 15) {
  return Array.from({ length: count }, (_, i) => {
    const idx = i % companyNames.length
    const statusIdx = i % statuses.length
    const region = regions[i % regions.length]

    return {
      id: 100000 + i,
      operatorCode: `OP${String(202600 + i).slice(-6)}`,
      operatorName: companyNames[idx],
      operatorStatusFlag: statuses[statusIdx],
      vppCount: Math.floor(Math.random() * 12) + 1,
      createdAt: randomDate(-365, -30),
      expireDate: statuses[statusIdx] === 2
        ? randomDate(-60, -1)
        : randomDate(30, 730),
      orgId: `org_${1000 + i}`
    }
  })
}
