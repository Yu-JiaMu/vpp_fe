# getDeviceList — 查询所有设备列表信息
[OpenAPI 接入指南](/openApiData/docs/OpenAPI接入指南.md)

## 查询设备列表接口

### 基本信息
- **Action**: `getDeviceList`
- **请求方法**: `GET`
- **接口描述**: 查询设备列表信息，支持分页和多种条件筛选

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| deviceIdentifier | String | 否 | - | 设备标识符 |
| name | String | 否 | - | 设备名称 |
| devState | String | 否 | - | 设备状态 |
| devEnable | Boolean | 否 | - | 是否启用 |
| productName | String | 否 | - | 产品名称 |
| nodeType | String | 否 | - | 设备类型 |
| pageSize | int | 否 | 10 | 页大小 |
| pageNum | int | 否 | 1 | 页码 |

### 设备状态：devState 枚举参数说明

| 状态值 | 描述 |
|--------|------|
| onLine | 在线 |
| offLine | 离线 |
| unactivation | 未激活 |

### 节点类型：nodeType 枚举参数说明

| 类型值 | 描述 |
|--------|------|
| direct-connect-device | 直连设备 |
| gateway-device | 网关设备 |
| gateway-sub-device | 网关子设备 |


### 响应字段说明
#### 设备对象字段说明

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | String | 是 | 设备主键ID |
| name | String | 是 | 设备名称 | 
| identifier | String | 是 | 设备唯一标识符 | 
| productId | String | 是 | 产品ID | 
| devState | String | 是 | 设备状态 | 
| devEnable | Boolean | 是 | 是否启用 |
| parentId | String | 否 | 上级设备的identifier |
| productName | String | 是 | 产品名称 | 
| nodeType | String | 是 | 节点类型 | 
| lastOnlineTime | String | 否 | 最后在线时间 |
| tagArray | String[] | 否 | 标签数组 | 
| subDeviceCount | Integer | 否 | 子设备数量 |
| parentDevice | String | 否 | 上级设备名称 |
| createTime | String | 否 | 创建时间 |
| updateTime | String | 否 | 更新时间 |
| remark | String | 否 | 备注 |

