# QueryProduct 接口

## 接口说明3

该接口用于查询IoT平台中所有设备的列表信息，支持按设备标识、名称、产品等条件筛选，并支持分页查询。

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| identifier | String | 否 | 设备标识符 |
| productName | String | 否 | 产品名称 |
| pageSize | Integer | 是 | 每页数量，最大100 |
| currentPage | Integer | 是 | 当前页码 |

## 返回示例

