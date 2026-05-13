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

/**
 * 生成运营商详情 mock 数据
 * @param {number|string} id - 运营商 ID
 * @returns {Object}
 */
export function generateMockOperatorDetail(id) {
  const numId = Number(id)
  const idx = (numId - 100000) % companyNames.length
  const statusIdx = (numId - 100000) % statuses.length
  const region = regions[(numId - 100000) % regions.length]

  const regionMap = {
    '广东省': {
      '广州市': '440103',
      '深圳市': '440303'
    },
    '浙江省': { '杭州市': null },
    '北京市': { '北京市': null },
    '江苏省': { '南京市': null },
    '四川省': { '成都市': '510104' },
    '山东省': { '济南市': null },
    '福建省': { '福州市': null },
    '湖南省': { '长沙市': null },
    '安徽省': { '合肥市': null }
  }
  const provinceValue = { '广东省': '440000', '四川省': '510000' }[region.province]
  const cityValue = { '广州市': '440100', '深圳市': '440300', '成都市': '510100' }[region.city]
  const districtValue = regionMap[region.province]?.[region.city] || null
  const regionCode = [provinceValue, cityValue, districtValue].filter(Boolean).join(',')

  const idxName = `img_${(numId % 3) + 1}`
  const imgUrl = `https://picsum.photos/seed/${idxName}/400/300`

  return {
    id: numId,
    operatorCode: `OP${String(202600 + (numId - 100000)).slice(-6)}`,
    operatorName: companyNames[idx],
    operatorShortName: companyNames[idx].replace(/[^(]+$/, '').slice(0, 8) || companyNames[idx].slice(0, 4),
    operatorStatusFlag: statuses[statusIdx],
    creditCode: `${String(91440100).padEnd(9, '0')}${String((numId - 100000) * 7).padStart(9, '0')}`.slice(0, 18),
    establishDate: randomDate(-3650, -730).split('T')[0],
    legalPerson: ['张伟', '王芳', '李强', '赵敏', '刘洋'][idx % 5],
    legalIdCard: `${String(1100001900 + (numId - 100000)).padEnd(18, 'X')}`.slice(0, 18),
    enterpriseAddress: `中国${region.province}${region.city}高新技术产业开发区创新路${(numId % 200) + 1}号`,
    regionCode,
    expireDate: statuses[statusIdx] === 2
      ? randomDate(-60, -1).replace('T', ' ').slice(0, 19)
      : randomDate(30, 730).replace('T', ' ').slice(0, 19),
    longitude: (113.2 + (numId % 50) * 0.1).toFixed(6),
    latitude: (23.1 + (numId % 30) * 0.1).toFixed(6),
    businessLicenseUrl: imgUrl,
    logoUrl: `https://picsum.photos/seed/logo_${idxName}/400/200`,
    contactName: ['陈经理', '林主管', '黄主任', '周先生', '吴女士'][idx % 5],
    contactPhone: `1${[38, 39, 50, 86, 58][idx % 5]}${String(89000000 + (numId - 100000) * 31).slice(0, 8)}`,
    contactEmail: `contact${(numId - 100000)}@${['energy.com', 'power.cn', 'electric.cn'][idx % 3]}`,
    createdAt: randomDate(-365, -30),
    orgId: `org_${numId}`
  }
}
